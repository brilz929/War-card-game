// Game variables
let deckId;
let houseScore = 0;
let playerScore = 0;
let handsPlayed = 0;
let warsCount = 0;
let currentStreak = 0;
let maxStreak = 0;

// DOM elements
const newGameBtn = document.getElementById("newGameBtn");
const drawBtn = document.getElementById("drawBtn");
const deckCounter = document.getElementById("deckCounter");
const houseScoreEl = document.getElementById("houseScore");
const playerScoreEl = document.getElementById("playerScore");
const houseCard = document.getElementById("houseCard");
const playerCard = document.getElementById("playerCard");
const resultDisplay = document.getElementById("resultDisplay");
const handsPlayedEl = document.getElementById("handsPlayed");
const warsCountEl = document.getElementById("warsCount");
const winRateEl = document.getElementById("winRate");
const streakEl = document.getElementById("streak");
const finalResult = document.getElementById("finalResult");
const finalTitle = document.getElementById("finalTitle");
const finalScore = document.getElementById("finalScore");

// Handle new game click
function handleNewGame() {
  fetch("https://deckofcardsapi.com/api/deck/new/shuffle/")
    .then((res) => res.json())
    .then((data) => {
      deckCounter.textContent = `${data.remaining} CARDS`;
      deckId = data.deck_id;
      console.log(deckId);

      // Reset scores
      houseScore = 0;
      playerScore = 0;
      handsPlayed = 0;
      warsCount = 0;
      currentStreak = 0;
      maxStreak = 0;

      // Update display
      houseScoreEl.textContent = houseScore;
      playerScoreEl.textContent = playerScore;
      handsPlayedEl.textContent = handsPlayed;
      warsCountEl.textContent = warsCount;
      streakEl.textContent = currentStreak;
      winRateEl.textContent = "0%";

      // Clear cards
      houseCard.innerHTML = '<span class="empty-slot">Ready</span>';
      playerCard.innerHTML = '<span class="empty-slot">Ready</span>';

      // Reset UI
      resultDisplay.textContent = "PLACE YOUR BETS!";
      resultDisplay.className = "result-display";
      drawBtn.disabled = false;
      finalResult.classList.remove("show");
    });
}

// Add event listener for new game
newGameBtn.addEventListener("click", handleNewGame);

// Draw cards
drawBtn.addEventListener("click", () => {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
    .then((res) => res.json())
    .then((data) => {
      deckCounter.textContent = `${data.remaining} CARDS`;
      handsPlayed++;
      handsPlayedEl.textContent = handsPlayed;

      // Display cards
      houseCard.innerHTML = `
                        <img src=${data.cards[0].image} alt="House card" />
                    `;
      playerCard.innerHTML = `
                        <img src=${data.cards[1].image} alt="Player card" />
                    `;

      // Determine winner
      const winnerText = determineCardWinner(data.cards[0], data.cards[1]);
      resultDisplay.textContent = winnerText;

      // Update win rate
      if (handsPlayed > 0) {
        const rate = ((playerScore / handsPlayed) * 100).toFixed(0);
        winRateEl.textContent = `${rate}%`;
      }

      // Check if game is over
      if (data.remaining === 0) {
        drawBtn.disabled = true;
        let finalMessage = "";

        if (houseScore > playerScore) {
          finalTitle.textContent = "♠ HOUSE WINS ♠";
          finalMessage = `Final Score: House ${houseScore} - Player ${playerScore}`;
        } else if (playerScore > houseScore) {
          finalTitle.textContent = "♦ PLAYER WINS ♦";
          finalMessage = `Final Score: Player ${playerScore} - House ${houseScore}`;
        } else {
          finalTitle.textContent = "♣ IT'S A TIE ♣";
          finalMessage = `Final Score: ${playerScore} - ${houseScore}`;
        }

        finalScore.innerHTML = `
                            ${finalMessage}<br>
                            <small style="font-size: 0.7em; opacity: 0.8;">
                                Hands Played: ${handsPlayed} | Wars: ${warsCount} | Best Streak: ${maxStreak}
                            </small>
                        `;
        finalResult.classList.add("show");
      }
    });
});

// Determine card winner
function determineCardWinner(card1, card2) {
  const valueOptions = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "JACK",
    "QUEEN",
    "KING",
    "ACE",
  ];
  const card1ValueIndex = valueOptions.indexOf(card1.value);
  const card2ValueIndex = valueOptions.indexOf(card2.value);

  if (card1ValueIndex > card2ValueIndex) {
    houseScore++;
    houseScoreEl.textContent = houseScore;
    currentStreak = 0;
    streakEl.textContent = currentStreak;
    resultDisplay.className = "result-display lose";
    return "✗ HOUSE WINS ✗";
  } else if (card1ValueIndex < card2ValueIndex) {
    playerScore++;
    playerScoreEl.textContent = playerScore;
    currentStreak++;
    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
    streakEl.textContent = currentStreak;
    resultDisplay.className = "result-display win";
    return "★ PLAYER WINS ★";
  } else {
    warsCount++;
    warsCountEl.textContent = warsCount;
    resultDisplay.className = "result-display war";
    return "⚔ WAR ⚔";
  }
}
