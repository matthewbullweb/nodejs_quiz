const db = require('../../src/persistence/sqlite');
const fs = require('fs');

const ITEM = {
    id: '7aef3d7c-d301-4846-8358-2a91ec9d6be3',
    name: 'Test',
    completed: false,
};

beforeEach(() => {
    if (fs.existsSync('/etc/todos/todo.db')) {
        fs.unlinkSync('/etc/todos/todo.db');
    }
});

test('it initializes correctly', async () => {
    await db.init();
});

test('it can store and retrieve Items', async () => {
    await db.init();

    await db.storeItem(Item);

    const Items = await db.getItems();
    expect(Items.length).toBe(1);
    expect(Items[0]).toEqual(Item);
});

test('it can update an existing Item', async () => {
    await db.init();

    const initialItems = await db.getItems();
    expect(initialItems.length).toBe(0);

    await db.storeItem(Item);

    await db.updateItem(
        Item.id,
        Object.assign({}, Item, { completed: !Item.completed }),
    );

    const Items = await db.getItems();
    expect(Items.length).toBe(1);
    expect(Items[0].completed).toBe(!Item.completed);
});

test('it can remove an existing Item', async () => {
    await db.init();
    await db.storeItem(Item);

    await db.removeItem(Item.id);

    const Items = await db.getItems();
    expect(Items.length).toBe(0);
});

test('it can get a single Item', async () => {
    await db.init();
    await db.storeItem(Item);

    const Item = await db.getItem(Item.id);
    expect(Item).toEqual(Item);
});
