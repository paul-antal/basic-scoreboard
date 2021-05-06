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
    StateStore.setValue({ players: [], banana: 10 })
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
        let addButton = createElement({ type: 'div', parent: container, classList: ['btn'], innerText: 'ADD' });
        addButton.tabIndex = 0;
        addButton.onclick = () => {
            let playerName = playerInput.value;
            this.players.push(playerName);
            this.draw();
        }

        for (let playerName of this.players) {
            createElement({ type: 'div', parent: container, innerText: playerName })
        }
        let doneButton = createElement({ type: 'div', parent: container, classList: ['btn'], innerText: 'DONE' });
        doneButton.tabIndex = 0;
        doneButton.onclick = () => this.createBoard();
    }

    createBoard() {
        let renderer = new ScoreBoardHtmlRenderer();
        let scoreBoard = new ScoreBoard(renderer);
        for(let player of this.players){
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
        let closeScoreboard = createElement({ type: 'div', parent: container, classList: ['btn', 'resetScores'], innerText: 'Close Scores' });
        closeScoreboard.onclick = () => {
            StateStore.removeValue();
            location.reload();
        };
        let resetScores = createElement({ type: 'div', parent: container, classList: ['btn', 'resetScores'], innerText: 'Reset Scores' });
        resetScores.onclick = () => scoreBoard.resetScores();
    }

    addPlayerBox(scoreBoard, container, playerIndex) {
        let player = scoreBoard.players[playerIndex];
        let playerBox = createElement({ type: 'div', parent: container, classList: ['playerBox'] });
        createElement({ type: 'div', parent: playerBox, classList: ['playerName'], innerText: player.name });
        let scoreInput = createElement({ type: 'input', parent: playerBox, classList: ['playerInput'] });
        scoreInput.type = 'number';
        scoreInput.dataset.playerIndex = playerIndex;
        scoreInput.value = 0;
        let total = player.scores.reduce((sum, val) => sum + val, 0);
        createElement({ type: 'div', parent: playerBox, classList: ['playerTotal'], innerText: total + '' })
        for (let score of player.scores.reverse()) {
            createElement({ type: 'div', parent: playerBox, classList: ['playerScore'], innerText: score + '' });
        }
    }

    addControls(container, scoreBoard) {
        let controls = createElement({ type: 'div', parent: container, classList: ['playerBox', 'controls'] })
        createElement({ type: 'div', parent: controls, classList: ['playerName'], innerText: '.' });
        let submitButton = createElement({ type: 'div', parent: controls, classList: ['btn', 'playerName'], innerText: 'SUBMIT' });
        submitButton.tabIndex = 0;
        submitButton.onclick = () => this.submitScores(scoreBoard);
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

function createElement({ type, classList, parent, innerText }) {
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
    return element;
}