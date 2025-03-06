import { cardCounter } from "../cardCounter";

function CardCounter() {
    const cardsNoPairs = [
        { suit: "spades", rank: "5", value: 5, handOwner: "Player", faceUp: true },
        { suit: "spades", rank: "10", value: 10, handOwner: "Player", faceUp: true },
        { suit: "diamonds", rank: "2", value: 2, handOwner: "Player", faceUp: true },
        { suit: "spades", rank: "3", value: 3, handOwner: "Player", faceUp: true },
        { suit: "clubs", rank: "K", value: 10, handOwner: "Cut", faceUp: true }
    ];

    const cardsTwoPairs = [
        { suit: "spades", rank: "5", value: 5, handOwner: "Player", faceUp: true },
        { suit: "hearts", rank: "5", value: 5, handOwner: "Player", faceUp: true },
        { suit: "diamonds", rank: "2", value: 2, handOwner: "Player", faceUp: true },
        { suit: "spades", rank: "2", value: 2, handOwner: "Player", faceUp: true },
        { suit: "clubs", rank: "K", value: 10, handOwner: "Cut", faceUp: true }
    ];
    const cardsThreeOfAKind = [
        { suit: "spades", rank: "5", value: 5, handOwner: "Player", faceUp: true },
        { suit: "hearts", rank: "5", value: 5, handOwner: "Player", faceUp: true },
        { suit: "diamonds", rank: "5", value: 5, handOwner: "Player", faceUp: true },
        { suit: "spades", rank: "2", value: 2, handOwner: "Player", faceUp: true },
        { suit: "clubs", rank: "K", value: 10, handOwner: "Cut", faceUp: true }
    ];

    const cardsFlush = [
        { suit: "spades", rank: "5", value: 5, handOwner: "Player", faceUp: true },
        { suit: "spades", rank: "4", value: 4, handOwner: "Player", faceUp: true },
        { suit: "spades", rank: "3", value: 3, handOwner: "Player", faceUp: true },
        { suit: "spades", rank: "2", value: 2, handOwner: "Player", faceUp: true },
        { suit: "clubs", rank: "K", value: 10, handOwner: "Cut", faceUp: true }
    ];

    cardCounter(cardsFlush); 
    return (
        <h1>Card Counter</h1>
    );
  }

export default CardCounter;