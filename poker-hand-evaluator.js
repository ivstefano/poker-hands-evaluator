/**
 * Data Structures
 */
class Suit {
    static CLUBS = 1
    static DIAMONDS = 2
    static HEARTS = 3
    static SPADES = 4
    static symbols = {1: '♣', 2: '♦', 3: '♥', 4: '♠'}

    static toSymbol(value) {
        return this.symbols[value]
    }
}

class Pip {
    static DEUCE = 2
    static TREY = 3
    static FOUR = 4
    static FIVE = 5
    static SIX = 6
    static SEVEN = 7
    static EIGHT = 8
    static NINE = 9
    static TEN = 10
    static JACK = 11
    static QUEEN = 12
    static KING = 13
    static ACE = 14
    static symbols = {
        2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
        11: 'J', 12: 'Q', 13: 'K', 14: 'A'
    }

    static toSymbol(value) {
        return this.symbols[value]
    }
}

class Card {
    suit
    pip

    constructor(pip, suit) {
        if (!Object.values(Suit).includes(suit)) {
            throw new Error(`Card constructed with invalid value for suit: '${suit}'`)
        }
        if (!Object.values(Pip).includes(pip)) {
            throw new Error(`Card constructed with invalid value for pip: '${pip}'`)
        }
        this.suit = suit
        this.pip = pip
    }
}

// Evaluating hands values
const ROYAL_FLUSH_VALUE = 9000
const STRAIGHT_FLUSH_VALUE = 8000
const FLUSH_VALUE = 7000
const STRAIGHT_VALUE = 6000
const FOURS_VALUE = 5000
const FULL_HOUSE_VALUE = 4000
const THREES_VALUE = 3000
const TWO_PAIRS_VALUE = 2000
const ONE_PAIR_VALUE = 1000

/**
 * Poker Checker Functions
 */
const isRoyalFlush = (hand) => isStraightFlush(hand) && hand[4].pip === Pip.ACE ? hand[4] : false

const isStraightFlush = (hand) => isStraight(hand) && isFlush(hand) ? hand[4] : false

const isFlush = (hand) => {
    validateHand(hand)
    if (hand.length !== 5) {
        return false
    }

    hand = sortBySuite(hand)

    return hand[0].suit === hand[4].suit ? hand[4] : false
}

const isStraight = (hand) => {
    validateHand(hand)
    if (hand.length !== 5) {
        return false
    }

    hand = sortByPip(hand)
    const handPips = hand.map((card) => card.pip)

    if (handPips[4] === Pip.ACE) {
        return areEqual(handPips, [Pip.DEUCE, Pip.TREY, Pip.FOUR, Pip.FIVE, Pip.ACE]) ||
            areEqual(handPips, [Pip.TEN, Pip.JACK, Pip.QUEEN, Pip.KING, Pip.ACE]) ? hand[4] : false
    } else {
        const SUM_OF_FIVE_CONSECUTIVE_NUMBERS = 10
        const firstPip = hand[0].pip
        return hand.reduce((sum, card) => sum + (card.pip - firstPip), 0) === SUM_OF_FIVE_CONSECUTIVE_NUMBERS ? hand[4] : false
    }
}

const isFours = (hand) => {
    validateHand(hand)
    if (hand.length !== 5) {
        return false
    }

    const handPips = sortByPipAndSuite(hand).map((card) => card.pip)

    if (areSame(handPips.slice(0, 4))) {
        return handPips[3]
    }

    if (areSame(handPips.slice(1, 5))) {
        return handPips[4]
    }

    return false
}

const isFullHouse = (hand) => {
    validateHand(hand)
    if (hand.length !== 5) {
        return false
    }

    const pips = sortByPipAndSuite(hand).map((card) => card.pip)

    if (areSame(pips.slice(0, 3)) && areSame(pips.slice(3, 5))) {
        return hand[2]
    }

    if (areSame(pips.slice(0, 2)) && areSame(pips.slice(2, 5))) {
        return hand[4]
    }

    return false
}

const isThrees = (hand) => {
    validateHand(hand)
    if (hand.length !== 5 || isFullHouse(hand) || isFours(hand)) {
        return false
    }

    const pips = sortByPipAndSuite(hand).map((card) => card.pip)
    if (areSame(pips.slice(0, 3))) {
        return hand[2]
    }
    if (areSame(pips.slice(1, 4))) {
        return hand[3]
    }
    if (areSame(pips.slice(2, 5))) {
        return hand [4]
    }

    return false
}

const isTwoPairs = (hand) => {
    validateHand(hand)
    if (hand.length !== 5 || isFullHouse(hand) || isFours(hand) || isThrees(hand)) {
        return false
    }

    const pips = sortByPipAndSuite(hand).map((card) => card.pip)
    if (areSame(pips.slice(0, 2)) && areSame(pips.slice(2, 4))) {
        return hand[3]
    }
    if (areSame(pips.slice(0, 2)) && areSame(pips.slice(3, 5))) {
        return hand[4]
    }
    if (areSame(pips.slice(1, 3)) && areSame(pips.slice(3, 5))) {
        return hand[4]
    }
    return false
}

const isOnePair = (hand) => {
    validateHand(hand)
    if (hand.length !== 5 || isFullHouse(hand) || isFours(hand) || isThrees(hand) || isTwoPairs(hand)) {
        return false
    }

    const pips = sortByPipAndSuite(hand).map((card) => card.pip)

    if (areSame(pips.slice(0, 2))) {
        return hand[1]
    }
    if (areSame(pips.slice(1, 3))) {
        return hand[2]
    }
    if (areSame(pips.slice(2, 4))) {
        return hand[3]
    }
    if (areSame(pips.slice(3, 5))) {
        return hand[4]
    }

    return false
}

/**
 * Hand Evaluation Functions
 */
const evaluateHand = (hand) => {
    let pokerHandValue = 0
    let highestCard = ''
    let pokerHand = 'Is Nothing'
    const handNicelyPrinted = handToString(hand)

    if (hand.length !== 5) {
        return {
            hand: handNicelyPrinted,
            pokerHand,
            highestCard,
            value: pokerHandValue
        }
    }

    const functionValues = [
        {fn: isRoyalFlush, value: ROYAL_FLUSH_VALUE},
        {fn: isStraightFlush, value: STRAIGHT_FLUSH_VALUE},
        {fn: isFlush, value: FLUSH_VALUE},
        {fn: isStraight, value: STRAIGHT_VALUE},
        {fn: isFours, value: FOURS_VALUE},
        {fn: isFullHouse, value: FULL_HOUSE_VALUE},
        {fn: isThrees, value: THREES_VALUE},
        {fn: isTwoPairs, value: TWO_PAIRS_VALUE},
        {fn: isOnePair, value: ONE_PAIR_VALUE}
    ]
    for (const functionValue of functionValues) {
        const pokerHandResult = functionValue.fn(hand)
        if (pokerHandResult) {
            pokerHand = functionValue.fn.name
            pokerHandValue += functionValue.value * pokerHandResult.pip * pokerHandResult.suit
            break
        }
    }

    hand = sortByPipAndSuite(hand)
    highestCard = hand[4]
    let pokerHandSentence = pokerHand.replace(/([a-z])([A-Z])/g, '$1 $2')
    pokerHandSentence = pokerHandSentence.charAt(0).toUpperCase() + pokerHandSentence.slice(1)
    return {
        print: handNicelyPrinted,
        pokerHand: pokerHandSentence,
        highestCard: handToString([highestCard]),
        value: pokerHandValue + highestCard.pip * 10 + highestCard.suit
    }
}

/**
 * Helper Functions
 */
const areEqual = (arrA, arrB) => JSON.stringify(arrA) === JSON.stringify(arrB)
const areSame = (arrA) => arrA.every((value, i, arr) => value === arr[0])

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message || 'Assertion failed')
    }
}

const validateHand = (hand) => {
    assert(Array.isArray(hand), `Argument hand with value '${JSON.stringify(hand)}' is not an array.`)
    hand.forEach((card, idx) => assert(card instanceof Card, `Object at position ${idx} '${JSON.stringify(card)}' is not of type Card.`))
}

const sortBySuite = (hand) => {
    hand.sort((cardA, cardB) => cardA.suit - cardB.suit)
    return hand
}

const sortByPip = (hand) => {
    hand.sort((cardA, cardB) => cardA.pip - cardB.pip)
    return hand
}

const sortByPipAndSuite = (hand) => {
    hand.sort((cardA, cardB) => (cardA.pip * 100 + cardA.suit) - (cardB.pip * 100 + cardB.suit))
    return hand
}


/**
 * Parsing and printing functions
 */
const buildCardListFromStringCards = (stringHand) => {
    const pipStrToPip = {
        '2': Pip.DEUCE, '3': Pip.TREY, '4': Pip.FOUR, '5': Pip.FIVE, '6': Pip.SIX, '7': Pip.SEVEN,
        '8': Pip.EIGHT, '9': Pip.NINE, '10': Pip.TEN, 'J': Pip.JACK, 'Q': Pip.QUEEN, 'K': Pip.KING, 'A': Pip.ACE
    }
    const suitStrToSuit = {
        'S': Suit.SPADES, 'D': Suit.DIAMONDS, 'H': Suit.HEARTS, 'C': Suit.CLUBS
    }
    let stringCard = stringHand.split(' ')

    return stringCard.map((strCard) => new Card(pipStrToPip[strCard.slice(0, -1)], suitStrToSuit[strCard.slice(-1)]))
}

const evaluateAndPrint = (playersWithCards) => {
    const hands = playersWithCards.map((playerWithCards) => ({
        ...playerWithCards,
        ...evaluateHand(buildCardListFromStringCards(playerWithCards.cards))
    }))
    hands.sort((handA, handB) => handB.value - handA.value)

    console.log('----- PLAYERS & HANDS -----')
    console.log(hands, '\n')

    console.log('----- WINNER -----')
    console.log(hands[0], '\n\n')
}

const handToString = (hand) => Object.values(hand).map((card) => Pip.toSymbol(card.pip) + Suit.toSymbol(card.suit)).join(' ')

/**
 * Tests
 */
const testHands = {
    '-------- ROYAL FLUSH ---------': true,
    'Non-Royal Flush Too Low': {
        fn: isRoyalFlush,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.NINE, Suit.SPADES),
            new Card(Pip.TEN, Suit.SPADES),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.SPADES),
            new Card(Pip.KING, Suit.SPADES)
        ]
    },
    'Non-Royal Flush Wrong Suit': {
        fn: isRoyalFlush,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.TEN, Suit.HEARTS),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.SPADES),
            new Card(Pip.KING, Suit.SPADES),
            new Card(Pip.ACE, Suit.SPADES)
        ]
    },
    'Royal Flush': {
        fn: isRoyalFlush,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.TEN, Suit.SPADES),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.SPADES),
            new Card(Pip.KING, Suit.SPADES),
            new Card(Pip.ACE, Suit.SPADES)
        ]
    },
    '-------- STRAIGHT FLUSH ---------': true,
    'Non-Straight Flush Wrong Suit': {
        fn: isStraightFlush,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.TREY, Suit.CLUBS),
            new Card(Pip.FOUR, Suit.SPADES),
            new Card(Pip.FIVE, Suit.SPADES),
            new Card(Pip.SIX, Suit.SPADES),
            new Card(Pip.SEVEN, Suit.SPADES)
        ]
    },
    'Non-Straight Flush Wrong Pip': {
        fn: isStraightFlush,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.DEUCE, Suit.SPADES),
            new Card(Pip.FOUR, Suit.SPADES),
            new Card(Pip.FIVE, Suit.SPADES),
            new Card(Pip.SIX, Suit.SPADES),
            new Card(Pip.SEVEN, Suit.SPADES)
        ]
    },
    'Straight Flush': {
        fn: isStraightFlush,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.TREY, Suit.SPADES),
            new Card(Pip.FOUR, Suit.SPADES),
            new Card(Pip.FIVE, Suit.SPADES),
            new Card(Pip.SIX, Suit.SPADES),
            new Card(Pip.SEVEN, Suit.SPADES)
        ]
    },
    '-------- FLUSH ---------': true,
    'Non-Flush Hand': {
        fn: isFlush,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.ACE, Suit.SPADES),
            new Card(Pip.EIGHT, Suit.DIAMONDS),
            new Card(Pip.DEUCE, Suit.DIAMONDS),
            new Card(Pip.KING, Suit.DIAMONDS),
            new Card(Pip.TEN, Suit.DIAMONDS)
        ]
    },
    'Flush Hand': {
        fn: isFlush,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.ACE, Suit.DIAMONDS),
            new Card(Pip.EIGHT, Suit.DIAMONDS),
            new Card(Pip.DEUCE, Suit.DIAMONDS),
            new Card(Pip.KING, Suit.DIAMONDS),
            new Card(Pip.TEN, Suit.DIAMONDS)
        ]
    },
    '-------- STRAIGHT ---------': true,
    'Non-Straight Hand': {
        fn: isStraight,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.NINE, Suit.DIAMONDS),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.CLUBS),
            new Card(Pip.KING, Suit.DIAMONDS),
            new Card(Pip.ACE, Suit.HEARTS)
        ]
    },
    'Straight Hand From Five': {
        fn: isStraight,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.FIVE, Suit.HEARTS),
            new Card(Pip.SIX, Suit.DIAMONDS),
            new Card(Pip.SEVEN, Suit.SPADES),
            new Card(Pip.EIGHT, Suit.CLUBS),
            new Card(Pip.NINE, Suit.DIAMONDS)
        ]
    },
    'Straight Hand From Deuce': {
        fn: isStraight,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.DEUCE, Suit.HEARTS),
            new Card(Pip.TREY, Suit.DIAMONDS),
            new Card(Pip.FOUR, Suit.SPADES),
            new Card(Pip.FIVE, Suit.CLUBS),
            new Card(Pip.SIX, Suit.DIAMONDS)
        ]
    },
    'Straight Hand From Trey': {
        fn: isStraight,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.NINE, Suit.HEARTS),
            new Card(Pip.TEN, Suit.DIAMONDS),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.CLUBS),
            new Card(Pip.KING, Suit.DIAMONDS)
        ]
    },
    'Straight Hand Starting With Ace': {
        fn: isStraight,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.ACE, Suit.HEARTS),
            new Card(Pip.DEUCE, Suit.DIAMONDS),
            new Card(Pip.TREY, Suit.SPADES),
            new Card(Pip.FOUR, Suit.CLUBS),
            new Card(Pip.FIVE, Suit.DIAMONDS)
        ]
    },
    'Straight Hand Ending With Ace': {
        fn: isStraight,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.TEN, Suit.DIAMONDS),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.CLUBS),
            new Card(Pip.KING, Suit.DIAMONDS),
            new Card(Pip.ACE, Suit.HEARTS)
        ]
    },
    '-------- FOURS ---------': true,
    'Fours Hand Higher Any Other Card': {
        fn: isFours,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.TEN, Suit.DIAMONDS),
            new Card(Pip.TEN, Suit.SPADES),
            new Card(Pip.TEN, Suit.CLUBS),
            new Card(Pip.TEN, Suit.HEARTS),
            new Card(Pip.JACK, Suit.DIAMONDS)
        ]
    },
    'Fours Hand Lower Any Other Card': {
        fn: isFours,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.NINE, Suit.SPADES),
            new Card(Pip.TEN, Suit.DIAMONDS),
            new Card(Pip.TEN, Suit.SPADES),
            new Card(Pip.TEN, Suit.CLUBS),
            new Card(Pip.TEN, Suit.HEARTS)
        ]
    },
    'Non-Fours Hand': {
        fn: isFours,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.NINE, Suit.SPADES),
            new Card(Pip.TEN, Suit.DIAMONDS),
            new Card(Pip.EIGHT, Suit.SPADES),
            new Card(Pip.TEN, Suit.CLUBS),
            new Card(Pip.TEN, Suit.HEARTS)
        ]
    },
    '-------- FULL HOUSE ---------': true,
    'Full House Hand Lower Three Higher Two': {
        fn: isFullHouse,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.JACK, Suit.CLUBS),
            new Card(Pip.JACK, Suit.HEARTS),
            new Card(Pip.JACK, Suit.DIAMONDS),
            new Card(Pip.ACE, Suit.DIAMONDS),
            new Card(Pip.ACE, Suit.SPADES)
        ]
    },
    'Full House Hand Lower Two Higher Three': {
        fn: isFullHouse,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.JACK, Suit.CLUBS),
            new Card(Pip.JACK, Suit.HEARTS),
            new Card(Pip.ACE, Suit.DIAMONDS),
            new Card(Pip.ACE, Suit.DIAMONDS),
            new Card(Pip.ACE, Suit.SPADES)
        ]
    },
    'Non-Full House Hand': {
        fn: isFullHouse,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.JACK, Suit.DIAMONDS),
            new Card(Pip.ACE, Suit.SPADES),
            new Card(Pip.ACE, Suit.CLUBS),
            new Card(Pip.TEN, Suit.HEARTS)
        ]
    },
    '-------- TREE OF A KIND ---------': true,
    'Three Of a Kind Hand Lower Threes': {
        fn: isThrees,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.DEUCE, Suit.CLUBS),
            new Card(Pip.DEUCE, Suit.HEARTS),
            new Card(Pip.DEUCE, Suit.DIAMONDS),
            new Card(Pip.NINE, Suit.DIAMONDS),
            new Card(Pip.EIGHT, Suit.SPADES)
        ]
    },
    'Three Of a Kind Hand Middle Threes': {
        fn: isThrees,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.FIVE, Suit.DIAMONDS),
            new Card(Pip.JACK, Suit.CLUBS),
            new Card(Pip.JACK, Suit.HEARTS),
            new Card(Pip.JACK, Suit.DIAMONDS),
            new Card(Pip.ACE, Suit.SPADES)
        ]
    },
    'Three Of a Kind Hand Higher Threes': {
        fn: isThrees,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.FIVE, Suit.DIAMONDS),
            new Card(Pip.QUEEN, Suit.CLUBS),
            new Card(Pip.QUEEN, Suit.HEARTS),
            new Card(Pip.QUEEN, Suit.DIAMONDS),
            new Card(Pip.TEN, Suit.SPADES)
        ]
    },
    'Non-Three Of a Kind Hand It\'s a Fours': {
        fn: isThrees,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.JACK, Suit.DIAMONDS),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.ACE, Suit.CLUBS),
            new Card(Pip.JACK, Suit.HEARTS)
        ]
    },
    'Non-Three Of a Kind Hand It\'s a Twos': {
        fn: isThrees,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.JACK, Suit.DIAMONDS),
            new Card(Pip.TEN, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.CLUBS),
            new Card(Pip.SEVEN, Suit.HEARTS)
        ]
    },
    '-------- TWO PAIRS ---------': true,
    'Two Pairs Hand Lower Two Pairs': {
        fn: isTwoPairs,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.DEUCE, Suit.CLUBS),
            new Card(Pip.DEUCE, Suit.HEARTS),
            new Card(Pip.TREY, Suit.DIAMONDS),
            new Card(Pip.TREY, Suit.DIAMONDS),
            new Card(Pip.EIGHT, Suit.SPADES)
        ]
    },
    'Two Pairs Hand Lower Pair And Higher Pair': {
        fn: isTwoPairs,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.DEUCE, Suit.CLUBS),
            new Card(Pip.DEUCE, Suit.HEARTS),
            new Card(Pip.EIGHT, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.DIAMONDS),
            new Card(Pip.QUEEN, Suit.DIAMONDS)
        ]
    },
    'Two Pairs Hand Two Higher Pairs': {
        fn: isTwoPairs,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.TREY, Suit.SPADES),
            new Card(Pip.SEVEN, Suit.CLUBS),
            new Card(Pip.SEVEN, Suit.HEARTS),
            new Card(Pip.KING, Suit.DIAMONDS),
            new Card(Pip.KING, Suit.DIAMONDS)
        ]
    },
    'Non-Two Pairs Hand It\'s a Four': {
        fn: isTwoPairs,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.JACK, Suit.DIAMONDS),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.ACE, Suit.CLUBS),
            new Card(Pip.JACK, Suit.HEARTS)
        ]
    },
    'Non-Two Pairs Hand It\'s a Pair': {
        fn: isTwoPairs,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.JACK, Suit.DIAMONDS),
            new Card(Pip.TEN, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.CLUBS),
            new Card(Pip.SEVEN, Suit.HEARTS)
        ]
    },
    '-------- ONE PAIR ---------': true,
    'One Pair Hand First One Pair': {
        fn: isOnePair,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.DEUCE, Suit.CLUBS),
            new Card(Pip.DEUCE, Suit.HEARTS),
            new Card(Pip.TREY, Suit.DIAMONDS),
            new Card(Pip.FOUR, Suit.DIAMONDS),
            new Card(Pip.EIGHT, Suit.SPADES)
        ]
    },
    'One Pair Hand Second Pair': {
        fn: isOnePair,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.DEUCE, Suit.CLUBS),
            new Card(Pip.FIVE, Suit.HEARTS),
            new Card(Pip.FIVE, Suit.SPADES),
            new Card(Pip.JACK, Suit.DIAMONDS),
            new Card(Pip.QUEEN, Suit.DIAMONDS)
        ]
    },
    'One Pair Hand Third Pair': {
        fn: isOnePair,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.TREY, Suit.SPADES),
            new Card(Pip.SEVEN, Suit.CLUBS),
            new Card(Pip.SEVEN, Suit.HEARTS),
            new Card(Pip.FIVE, Suit.DIAMONDS),
            new Card(Pip.KING, Suit.DIAMONDS)
        ]
    },
    'One Pair Hand Fourth Pair': {
        fn: isOnePair,
        toStr: handToString,
        expected: true,
        fnArguments: [
            new Card(Pip.TREY, Suit.SPADES),
            new Card(Pip.ACE, Suit.CLUBS),
            new Card(Pip.ACE, Suit.HEARTS),
            new Card(Pip.FIVE, Suit.DIAMONDS),
            new Card(Pip.KING, Suit.DIAMONDS)
        ]
    },
    'Non-One Pair Hand It\'s a Four': {
        fn: isOnePair,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.JACK, Suit.DIAMONDS),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.ACE, Suit.CLUBS),
            new Card(Pip.JACK, Suit.HEARTS)
        ]
    },
    'Non-One Pair Hand It\'s a Three': {
        fn: isOnePair,
        toStr: handToString,
        expected: false,
        fnArguments: [
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.JACK, Suit.DIAMONDS),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.CLUBS),
            new Card(Pip.SEVEN, Suit.HEARTS)
        ]
    },
    '------- HAND EVALUATION -------': true,
    'Hand Evaluation Straight Ace Of Spades': {
        fn: evaluateHand,
        toStr: handToString,
        expected: STRAIGHT_VALUE + Pip.ACE * 10 + Suit.SPADES,
        fnArguments: [
            new Card(Pip.ACE, Suit.SPADES),
            new Card(Pip.KING, Suit.DIAMONDS),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.CLUBS),
            new Card(Pip.TEN, Suit.HEARTS)
        ]
    },
    '------- DECODE HANDS -------': true,
    'Test Hand Evaluation': {
        fn: buildCardListFromStringCards,
        expected: [
            new Card(Pip.ACE, Suit.SPADES),
            new Card(Pip.KING, Suit.DIAMONDS),
            new Card(Pip.JACK, Suit.SPADES),
            new Card(Pip.QUEEN, Suit.CLUBS),
            new Card(Pip.TEN, Suit.HEARTS)
        ],
        fnArguments: 'AS KD JS QC 10H'
    }
}

function runTests() {
    for (const [name, test] of Object.entries(testHands)) {
        console.log(name)
        if (test instanceof Object && test.fn instanceof Function && test.fnArguments) {
            let fnResult = test.fn(test.fnArguments)
            try {
                assert(
                    JSON.stringify(fnResult) === JSON.stringify(test.expected),
                    `Function '${test.fn.name}' returned '${JSON.stringify(fnResult)}' instead of '${JSON.stringify(test.expected)}'.`
                )
            } catch (e) {
                console.log('\\033[31m' + e.message + '\\033[0m')
                continue
            }

            console.log(
                '[ ' + (test.toStr ? test.toStr(test.fnArguments) : JSON.stringify(test.fnArguments)) + ' ]',
                `${test.fn.name}:`, fnResult, '\n'
            )
        }
    }
}

// runTests()



/**
 * Main Execution
 */

console.log('============================')
console.log('=          ROUND 1         =')
console.log('============================')
evaluateAndPrint(
    [
        {name: 'Shade', cards: 'AC AD 7H KS QC'},
        {name: 'Zigi', cards: '7C 7D 8H 8S 10C'},
        {name: 'Dobri', cards: 'KC 9D 6H 7S QC'},
    ]
)

console.log('============================')
console.log('=          ROUND 2         =')
console.log('============================')
evaluateAndPrint(
    [
        {name: 'Dobri', cards: '8C 8D 7H 7S 10C'},
        {name: 'Zigi', cards: '8C 8D 7H 7S 9C'},
        {name: 'Shade', cards: '8C 8D 7H 7S 8S'}
    ]
)

console.log('===========================')
console.log('=          ROUND 3        =')
console.log('===========================')
evaluateAndPrint(
    [
        {name: 'Zigi', cards: '2C 4D 6H 8S 10S'},
        {name: 'Shade', cards: '3C 3D 3S KS KC'},
        {name: 'Dobri', cards: '2S 2D 2H AS AS'},
    ]
)