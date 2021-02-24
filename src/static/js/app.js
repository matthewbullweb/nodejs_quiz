function App() {
    const { Container, Row, Col } = ReactBootstrap;
    return (
        <Container>
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    <TodoListCard />
                </Col>
            </Row>  
        </Container>
    );
}

function TodoListCard() {
    const [Items, setItems] = React.useState(null);

    const [newSession, setNewSession] = React.useState('');

    React.useEffect(() => {
        fetch('/Items')
            .then(r => {if(r.ok) return r.json();})
            .then(setItems)
    }, []);

    React.useEffect(() => {
        fetch('/session')
            .then(r => {
                if(r.ok) {
                    var data = r.json();
                    console.log(data);
                    return data;
                }
            }).then(setNewSession)
    }, []);

    const onNewItem = React.useCallback(
        newItem => {
            setItems([...Items, newItem]);
        },
        [Items],
    );

    const onItemUpdate = React.useCallback(
        Item => {
            const index = Items.findIndex(i => i.id === Item.id);
            setItems([
                ...Items.slice(0, index),
                Item,
                ...Items.slice(index + 1),
            ]);
        },
        [Items],
    );

    const onItemRemoval = React.useCallback(
        Item => {
            const index = Items.findIndex(i => i.id === Item.id);
            setItems([...Items.slice(0, index), ...Items.slice(index + 1)]);
        },
        [Items],
    );

    if (Items === null) return 'Loading...';

    if (Items != undefined) return (
        <React.Fragment>
            <div class="text-center">
                You are logged in as: {newSession.name} ({newSession.role})<br /> <a class="btn btn-primary my-3" href="logout">Logout</a>
            </div>
            {newSession.role === 'admin' && (<AddItemForm onNewItem={onNewItem} />)}
            {Items.length === 0 && (
                <p className="text-center">You have no todo Items yet! Add one above! </p>
            )}
            {Items.map(Item => (
                <ItemDisplay
                    Item={Item}
                    Role={newSession.role}
                    key={Item.id}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                />
            ))}
        </React.Fragment>
    );
    else return (
        <React.Fragment>
            <p className="text-center">You need to login first!
                <div class="text-center">
                    <form method="post" action="session" class="login_form">
                        <input type="submit" class="btn btn-primary mr-3" value="Admin"/>
                    </form>
                    <form method="post" action="user_session" class="login_form">
                        <input type="submit" class="btn btn-primary my-3" value="User"/>
                    </form>
                </div>
            </p>
        </React.Fragment>
    );
}

function AddItemForm({ onNewItem }) {
    const { Form, InputGroup, Button } = ReactBootstrap;

    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const submitNewItem = e => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/Items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(Item => {
                onNewItem(Item);
                setSubmitting(false);
                setNewItem('');
            });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={!newItem.length}
                        className={submitting ? 'disabled' : ''}
                    >
                        {submitting ? 'Adding...' : 'Add'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

function ItemDisplay({ Item, Role, onItemUpdate, onItemRemoval }) {
    const { Container, Row, Col, Button } = ReactBootstrap;

    const toggleCompletion = () => {
        fetch(`/Items/${Item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: Item.name,
                completed: !Item.completed,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(onItemUpdate);
    };

    const removeItem = () => {
        fetch(`/Items/${Item.id}`, { method: 'DELETE' }).then(() =>
            onItemRemoval(Item),
        );
    };

    return (
        <Container fluid className={`Item ${Item.completed && 'completed'}`}>
            <Row>
                <Col xs={1} className="text-center">
                    <Button
                        className="toggles"
                        size="sm"
                        variant="link"
                        onClick={toggleCompletion}
                        aria-label={
                            Item.completed
                                ? 'Mark Item as incomplete'
                                : 'Mark Item as complete'
                        }
                    >
                        <i
                            onClick={toggleCompletion}
                            className={`far ${
                                Item.completed ? 'fa-check-square' : 'fa-square'
                            }`}
                        />
                    </Button>
                </Col>
                <Col xs={10} className="name">
                    {Item.name}
                </Col>            
                <Col xs={1} className="text-center remove">
                {Role === 'admin' && (<Button
                        size="sm"
                        variant="link"
                        onClick={removeItem}
                        aria-label="a1"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>)}
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <AnswerListCard item={Item} role={Role} />
                </Col>
            </Row>
        </Container>
    );
}

function AnswerListCard(data) {
    const [answers, setAnswers] = React.useState(null);

    React.useEffect(() => {
        fetch(`/answers/${data.item.id}`, {method: 'GET'})
            .then(r => {
            var data = r.json();
            //console.log(data);
            return data;
            })
            .then(setAnswers);
    }, []);

    const onNewAnswer = React.useCallback(
        newAnswer => {
            setAnswers([...answers, newAnswer]);
        },
        [answers],
    );

    const onAnswerUpdate = React.useCallback(
        answer => {
            const index = answers.findIndex(i => i.id === answer.id);
            setAnswer([
                ...answers.slice(0, index),
                answer,
                ...answers.slice(index + 1),
            ]);
        },
        [answers],
    );

    const onAnswerRemoval = React.useCallback(
        answer => {
            const index = answers.findIndex(i => i.id === answer.id);
            setAnswers([...answers.slice(0, index), ...answers.slice(index + 1)]);
        },
        [answers],
    );

    if (answers === null) return 'Loading...';

    if (answers != undefined) return (
        <React.Fragment>
            {data.role === 'admin' && (<AddAnswerForm item={data.item.id} onNewAnswer={ onNewAnswer } />)}
            {answers.length === 0 && (
                <p className="text-center">You have no answers yet!</p>
            )}
            {answers.map(answer => (
                <AnswerDisplay
                    answer={answer}
                    Role={data.role}
                    key={answer.id}
                    onAnswerRemoval={onAnswerRemoval}
                />
            ))}
        </React.Fragment>
    );
    else return (
        <React.Fragment>
                <p className="text-center">No answers found!</p>
        </React.Fragment>
    );
}

function AddAnswerForm(data,{ onNewAnswer }) {
    const { Form, InputGroup, Button } = ReactBootstrap;

    const [newAnswer, setNewAnswer] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    //if(typeof data !== 'undefined') console.log({"data":data});

    const submitNewAnswer = e => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/answers', {
            method: 'POST',
            body: JSON.stringify({ qid: data.item, value: newAnswer }), //data.item.id
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(answer => {
                data.onNewAnswer(answer);
                setSubmitting(false);
                setNewAnswer('');
            });
    };

    return (
        <Form onSubmit={submitNewAnswer}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newAnswer}
                    onChange={e => setNewAnswer(e.target.value) }
                    type="text"
                    placeholder="New Answer"
                    aria-describedby="basic-addon1"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={!newAnswer.length}
                        className={submitting ? 'disabled' : ''}
                    >
                        {submitting ? 'Adding...' : 'Add'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

function AnswerDisplay({ answer, Role, onAnswerRemoval }) {
    const { Container, Row, Col, Button } = ReactBootstrap;

    const removeAnswer = () => {
        fetch(`/answers/${answer.id}`, { method: 'DELETE' }).then(() =>
            onAnswerRemoval(answer),
        );
    };

    return (
        <Container fluid className={`answer `}>
            <Row>
                <Col xs={1} className="id">
                    {answer.id}
                </Col>
                <Col xs={10} className="value">
                    {answer.value}
                </Col>
                <Col xs={1} className="text-center remove">
                {Role === 'admin' && (<Button
                        size="sm"
                        variant="link"
                        onClick={removeAnswer}
                        aria-label="Remove Answer"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>)}
                </Col>
            </Row>
        </Container>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
