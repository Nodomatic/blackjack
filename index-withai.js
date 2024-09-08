const readline = require('readline');

const families = ["Pique", "Trefle", "Coeur", "Carreau"]
const cartes = ["2","3","4","5","6","7","8","9","10","Valet","Dame","Roi","As"]
const points = [2,3,4,5,6,7,8,9,10,10,10,10,99]

var defaultDeck = []

var playingDeck = []

var currentCard = 0
var dealerCards = []
var playerCards = []
var dealerPoints = 0
var playerPoints = 0
var toShuffle = false

var win = 0
var tie = 0
var loss = 0
var totalCards = 0

var ai = false
var aiRemainingGames = 0
var aiRate = 0.45

var totalGames = 0
// var aiGames = 0
// var aiwin = 0
// var rates = []

function askQuestion(query) {
    if(ai == true){
        if(query == "Continue (c) or stop (s)?"){
            if(aiRemainingGames > 0){
                return "c";
            }else{
                // console.log('AI finished. Changing value rate and starting back :).')
                // if(aiRate < 0.05){
                //     return "s"
                // }
                // aiRemainingGames = 10000
                // aiRate = aiRate - 0.05
                // rates.push(aiwin/aiGames)
                // aiwin = 0
                // aiGames = 0
                // return "c";
                return "s";
            }
        }else if(query == "Hit (h) or Stand (s)?"){
            aiRemainingGames--
            let x = playingDeck.length
            let wins = 0
            let losses = 0
            while(x > currentCard){
                let tempDeckPlayer = []
                x--
                tempDeckPlayer = [...playerCards]
                tempDeckPlayer.push(playingDeck[x])
                let value = calculatePoints(tempDeckPlayer)
                if(value < 21){
                    wins++
                }else{
                    losses++
                }
            }
            // console.log(`Wins: ${wins} Loss: ${losses}`)
            // console.log(`Chances of being under 21: ${wins/(playingDeck.length - currentCard)}`)
            if(wins/(playingDeck.length - currentCard) > aiRate){
                // console.log('Hitting')
                return "h"
            }else{
                // console.log('Standing')
                return "s"
            }
        }
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

function createDefaultDeck(){
    families.forEach(family => {
        cartes.forEach(carte => {
            defaultDeck.push(family+"_"+carte)
        });
    });
}

function createPlayingDeck(deckNumber){
    let x = 0
    while (x < deckNumber){
        x++
        playingDeck = playingDeck.concat(defaultDeck)
    }
}

function shuffleDeck(deck) {
    console.log("shuffling and going back to 0")
    currentCard = 0
    for (let i = deck.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function drawCard(deck, array){
    let card = deck[currentCard]
    currentCard++
    totalCards++

    array.push(card)

    if (deck.length - currentCard <= 60){
        toShuffle = true
    }
    return;
}

function calculatePoints(array){
    let x = 0
    let y = 0
    array.forEach(card => {
        card = card.split("_")
        let i = cartes.indexOf(card[1])
        if(points[i] == 99){
            y++
            return;
        }
        x = x + points[i]
    });

    if(y != 0){
        while(y != 0){
            
            if(x+11 >= 21 && y > 1){
                x = x + 1
            }else if(x+11 > 21 && y <= 1){
                x = x + 1
            }else if(x+11 <= 21 && y > 1){
                x = x + 1
            }else if(x+11 <= 21 && y <= 1){
                x = x + 11
            }

            y--
        }
    }

    return x;
}

function showGame(showHidden){
    if(ai == true){
        return;
    }
    if(showHidden){
        console.log(`\n\n\n------------------------------------------------------------\n\n\n`)
        console.log(`Dealer: ${dealerCards} --> ${dealerPoints}\nPlayer: ${playerCards} --> ${playerPoints}`)
    }else{
        console.log(`\n\n\n------------------------------------------------------------\n\n\n`)
        console.log(`Dealer: ${dealerCards[0]} --> HIDDEN\nPlayer: ${playerCards} --> ${playerPoints}`)
    }
}

async function startGame(deck){
    console.log("new game, cleaning dealer and player hands.")
    console.log(`\n\n\n------------------------------------------------------------\n\n\n`)
    dealerCards = []
    playerCards = []
    dealerPoints = 0
    playerPoints = 0
    totalGames++
    // aiGames++

    if(toShuffle){
        console.log('Cards need to be shuffled.')
        shuffleDeck(deck)
    }

    drawCard(deck, dealerCards)
    drawCard(deck, playerCards)
    drawCard(deck, dealerCards)
    drawCard(deck, playerCards)
    
    dealerPoints = calculatePoints(dealerCards)
    playerPoints = calculatePoints(playerCards)
    showGame(false)

    if(playerPoints == 21 && dealerPoints == 21){
        tie++
        showGame(true)
        console.log('You and the dealer both have 21. Nobody wins.')
    }

    if(playerPoints == 21){
        win++
        // aiwin++
        showGame(true)
        console.log("You got 21, you won.")
        return;
    }

    if(dealerPoints == 21){
        loss++
        showGame(true)
        console.log('The dealer got 21, you lost.')
        return;
    }

    let status;
    while(true){
        const ans = await askQuestion("Hit (h) or Stand (s)?");
        if(ans == "h"){
            drawCard(deck, playerCards)
            playerPoints = calculatePoints(playerCards)

            if(playerPoints > 21){
                status = "bust"
                showGame(true)
                break;
            }else if(playerPoints == 21){
                status = "21"
                showGame(false)
                break;
            }
            showGame(false)
        }else{
            status = "stand"
            showGame(false)
            break;
        }
    }

    // console.log(status)
    if(status == "bust"){
        console.log('You busted. You lost.')
        loss++
        return;
    }

    let dealerStatus;
    while(dealerPoints <= playerPoints && dealerPoints < 21){
        drawCard(deck, dealerCards)
        dealerPoints = calculatePoints(dealerCards)
        if(dealerPoints == 21 && playerPoints == 21){
            dealerStatus = "bothmax"
            showGame(true)
            break;
        }
        showGame(true)
    }
    
    showGame(true)

    // console.log(dealerStatus)
    if(dealerStatus == "bothmax"){
        console.log('You and the dealer both got 21 points. Nobody wins.')
        tie++
        return;
    }

    if(dealerPoints > 21){
        console.log('The dealer busted, you won.')
        win++
        // aiwin++
        return;
    }else if(dealerPoints > playerPoints){
        console.log('The dealer got a higher score, you lost.')
        loss++
        return;
    }else{
        console.log("I don't know how to handle lol")
        return;
    }
}

async function initGame(){
    createDefaultDeck()
    if (defaultDeck.length != 52){
        console.log(defaultDeck)
        console.log(defaultDeck.length)
        return "Default deck is not good."
    }

    createPlayingDeck(6)
    // console.log(playingDeck.length)
    // console.log(playingDeck)

    shuffleDeck(playingDeck)
    // console.log(playingDeck.length)
    // console.log(playingDeck)

    console.log("Everything is good, can start.")

    const aiAsk = await askQuestion("Play with ai? (y or n)")
    if(aiAsk == "y"){
        const askGames = await askQuestion("How many games should the AI play?")
        ai = true
        aiRemainingGames = parseInt(askGames)
    }else{
        ai = false
    }

    while(true){
        await startGame(playingDeck)
        const ans = await askQuestion("Continue (c) or stop (s)?");
        if(ans == "s"){
            break;
        }
    }

    console.log(`\n\n\n------------------------------------------------------------\n\n\n`)
    console.log(`Goodbye. Here are your stats!\nCurrent card in deck: ${currentCard}\nTotal of cards played: ${totalCards}\nTotal amount of games: ${win+tie+loss}\n\nAmout of wins: ${win}\nAmount of ties: ${tie}\nAmount of loss: ${loss}\n\nYour win ratio: ${Math.floor((win/totalGames)*100)}%\n\nYour loss ratio: ${Math.floor((loss/totalGames)*100)}%`)
    // console.log(rates)
    // var newvalue = 1
    // rates.forEach(rate => {
    //     console.log(`\n\n${newvalue}: ${rate}`)
    //     newvalue = newvalue - 0.05
    // })
}


initGame()
