function start() {

    let existingGameData = StateStore.getValue();
    if (!existingGameData) {
        renderScoreBoardCreator();
    } else {
        renderScoreBoard(existingGameData);
    }
}

class StateStore {
    static setValue(value) {
        localStorage.setItem('state', JSON.stringify(value))
    }

    static getValue() {
        let value = localStorage.getItem('state');
        return value && JSON.parse(value);
    }

    static removeValue() {
        localStorage.removeItem('state');
    }
}

function renderScoreBoardCreator() {
    let creatorRenderer = new HtmlScoreBoardCreator();
    creatorRenderer.draw();
}

function renderScoreBoard(gameData) {
    let renderer = new ScoreBoardHtmlRenderer();
    let scoreBoard = new ScoreBoard(renderer);
    scoreBoard.gamesPlayed = gameData.gamesPlayed;
    scoreBoard.players = gameData.players;
    scoreBoard.draw();
}

class HtmlScoreBoardCreator {
    constructor() {
        this.players = [];
    }
    draw() {
        let container = document.getElementById('container');
        container.innerHTML = '';
        let playerInput = createElement({ type: 'input', parent: container })
        playerInput.placeholder = 'Player name'
        playerInput.focus();
        createElement({
            type: 'div',
            parent: container,
            classList: ['btn'],
            innerText: 'ADD',
            isButton: true,
            onclick: () => {
                let playerName = playerInput.value;
                this.players.push(playerName);
                this.draw();
            }
        });

        for (let playerName of this.players) {
            createElement({ type: 'div', parent: container, innerText: playerName })
        }
        createElement({
            type: 'div',
            parent: container,
            classList: ['btn'],
            innerText: 'DONE',
            isButton: true,
            onclick: () => this.createBoard()
        });
    }

    createBoard() {
        let renderer = new ScoreBoardHtmlRenderer();
        let scoreBoard = new ScoreBoard(renderer);
        for (let player of this.players) {
            scoreBoard.addPlayer(player);
        }
        scoreBoard.draw();
    }
}

class ScoreBoard {
    constructor(renderer) {
        this.renderer = renderer;
        this.players = [];
        this.gamesPlayed = 0;
    }

    addPlayer(name) {
        let scores = [];
        for (let i = 0; i < this.gamesPlayed; i++) {
            this.scores.push(0);
        }
        let player = { name: name, scores: scores }
        this.players.push(player);
        this.updateState();
    }

    addScores(scores) {
        this.gamesPlayed++;
        for (let i = 0; i < scores.length; i++) {
            let player = this.players[i];
            player.scores.push(scores[i]);
        }
        this.updateState();
    }

    updateState() {
        StateStore.setValue({ gamesPlayed: this.gamesPlayed, players: this.players });
        this.draw();
    }

    resetScores() {
        for (let player of this.players) {
            player.scores = [];
        }
        this.gamesPlayed = 0;
        this.updateState();
    }

    draw() {
        this.renderer.draw(this);
    }
}

class ScoreBoardHtmlRenderer {
    draw(scoreBoard) {
        let container = document.getElementById('container');
        container.innerHTML = '';
        let boardControls = createElement({ type: 'div', parent: container, classList: ['boardControls'] });
        let scoreContainer = createElement({ type: 'div', parent: container, classList: ['scoreContainer'] });
        this.addRootControls(boardControls, scoreBoard);
        for (let i = 0; i < scoreBoard.players.length; i++) {
            this.addPlayerBox(scoreBoard, scoreContainer, i);
        }
        this.addControls(scoreContainer, scoreBoard);
    }

    addRootControls(container, scoreBoard) {
        let closeScoreboard = createElement({
            type: 'div',
            parent: container,
            classList: ['btn', 'resetScores'],
            innerText: 'Create new board',
            isButton: true,
            onclick: () => {
                StateStore.removeValue();
                location.reload();
            }
        });
        createElement({
            type: 'div',
            parent: container,
            classList: ['btn', 'resetScores'],
            innerText: 'Reset Scores',
            isButton: true,
            onclick: () => scoreBoard.resetScores()
        });
    }

    addPlayerBox(scoreBoard, container, playerIndex) {
        let player = scoreBoard.players[playerIndex];
        let playerBox = createElement({ type: 'div', parent: container, classList: ['playerBox'] });
        createElement({ type: 'div', parent: playerBox, classList: ['playerName'], innerText: player.name });
        let scoreInput = createElement({ type: 'input', parent: playerBox, classList: ['playerInput'] });
        scoreInput.type = 'number';
        scoreInput.placeholder = '0';
        scoreInput.dataset.playerIndex = playerIndex;
        let total = player.scores.reduce((sum, val) => sum + val, 0);
        createElement({ type: 'div', parent: playerBox, classList: ['playerTotal'], innerText: total + '' })
        for (let score of player.scores.slice().reverse()) {
            createElement({ type: 'div', parent: playerBox, classList: ['playerScore'], innerText: score + '' });
        }
    }

    addControls(container, scoreBoard) {
        let controls = createElement({ type: 'div', parent: container, classList: ['playerBox', 'controls'] })
        createElement({ type: 'div', parent: controls, classList: ['playerName'], innerText: '.' });
        let submitButton = createElement({
            type: 'div',
            parent: controls,
            classList: ['btn', 'playerInput'],
            innerText: 'SUBMIT',
            isButton: true,
            onclick: () => this.submitScores(scoreBoard)
        });
        createElement({ type: 'div', parent: controls, classList: ['playerTotal'], innerText: 'TOTAL' });
        for (let i = scoreBoard.gamesPlayed; i > 0; i--) {
            createElement({ type: 'div', parent: controls, classList: ['playerScore'], innerText: `${i}.` });
        }
    }

    submitScores(scoreBoard) {
        let scoreInputs = document.getElementsByClassName('playerInput');
        let scores = [];
        for (let input of scoreInputs) {
            scores[input.dataset.playerIndex] = Number(input.value);
        }
        scoreBoard.addScores(scores);
    }
}

function createElement({ type, classList, parent, innerText, isButton, onclick }) {
    let element = document.createElement(type);
    if (classList) {
        for (let className of classList) {
            element.classList.add(className);
        }
    }
    if (parent) {
        parent.appendChild(element);
    }
    if (innerText) {
        element.innerText = innerText;
    }

    element.onclick = onclick;

    if (isButton) {
        element.tabIndex = 0;
        element.addEventListener("keydown", (e) => {
            if (e.keyCode === 13) {
                element.onclick();
            }
        })
    }
    return element;
}