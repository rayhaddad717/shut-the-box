"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import ReactDice, { ReactDiceRef } from "react-dice-complete";
import { useDisclosure } from "@nextui-org/modal";
import { CONSTANTS } from "./constants/index";

import GameSuccessOverModal from "./gameSuccessOverModal";

const GAME_STATES = {
  NEW_GAME: 0,
  PENDING_DICE_ROLL: 1,
  ROLLING_DICE: 2,
  WAITING_For_RESPONSE: 3,
  GAME_OVER: 4,
  GAME_COMPLETE: 5,
};

function Game() {
  //dice ref
  const reactDice = useRef(null);
  const [gameState, setGameState] = useState(GAME_STATES.NEW_GAME);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dieValue, setDieValue] = useState(0);
  const [secondDieValue, setSecondDieValue] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(new Set());
  const [lastTurnSelectedOptions, setLastTurnSelectedOptions] = useState(
    new Set()
  );
  //game over or success modal state
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  //random message shown to the player
  const [displayMessage, setDisplayMessage] = useState("");
  //check if the selection is valid
  const isSelectionValid = useMemo(() => {
    const sum = dieValue + secondDieValue;
    const hasSum =
      lastTurnSelectedOptions.has(sum) && lastTurnSelectedOptions.size === 1;
    const hasBoth =
      lastTurnSelectedOptions.has(dieValue) &&
      lastTurnSelectedOptions.has(secondDieValue) &&
      lastTurnSelectedOptions.size === 2;
    return hasSum || hasBoth;
  }, [lastTurnSelectedOptions, dieValue, secondDieValue]);
  //get if the game is still on
  const isGameOn = useMemo(() => {
    return (
      gameState !== GAME_STATES.GAME_OVER &&
      gameState !== GAME_STATES.GAME_COMPLETE &&
      gameState !== GAME_STATES.NEW_GAME
    );
  }, [gameState]);
  //function to roll the dice
  const rollDice = () => {
    //check if the dice are not already rolling
    if (gameState === GAME_STATES.ROLLING_DICE) return;
    setGameState(GAME_STATES.ROLLING_DICE);
    reactDice.current?.rollAll();
  };
  const handleRollDice = useCallback(
    (totalValue, [dieValue, secondDieValue]) => {
      //don't allow the dice to be rolled if the game state is new
      if (gameState === GAME_STATES.NEW_GAME) return;
      setDieValue(dieValue);
      setSecondDieValue(secondDieValue);
      setGameState(GAME_STATES.WAITING_For_RESPONSE);
    },
    [setDieValue, setSecondDieValue, setGameState, gameState]
  );
  //function to start the game
  const startGame = useCallback(() => {
    // //roll the dice if the game state is new, not if the game is restarted
    // if (gameState === GAME_STATES.NEW_GAME) rollDice();
    rollDice();
    setSelectedOptions(new Set());
    setLastTurnSelectedOptions(new Set());
    setGameState(GAME_STATES.PENDING_DICE_ROLL);
  }, [gameState, setSelectedOptions, setLastTurnSelectedOptions]);

  //function to handle the option click
  const handleOptionClick = useCallback(
    (option) => {
      //only allow selection if the game state is waiting for response
      if (gameState !== GAME_STATES.WAITING_For_RESPONSE) return;

      if (lastTurnSelectedOptions.has(option)) {
        setLastTurnSelectedOptions((prev) => {
          prev.delete(option);
          return new Set(prev);
        });
      } else {
        setLastTurnSelectedOptions((prev) => {
          prev.add(option);
          return new Set(prev);
        });
      }
    },
    [lastTurnSelectedOptions, setLastTurnSelectedOptions, gameState]
  );
  //function to handle the submit of the round
  const handleSubmit = useCallback(() => {
    //check if the selection is valid
    if (!isSelectionValid) return;
    //check if we are in the correct game state
    if (gameState !== GAME_STATES.WAITING_For_RESPONSE) return;
    //display a random message to the player
    setDisplayMessage(
      CONSTANTS.SASSY_MESSAGES[
        Math.floor(Math.random() * CONSTANTS.SASSY_MESSAGES.length)
      ]
    );
    setSelectedOptions((prev) => {
      return new Set([...prev, ...lastTurnSelectedOptions]);
    });
    //increment the score of the player
    setScore((prev) => prev + 1);
    setLastTurnSelectedOptions(new Set());
    setGameState(GAME_STATES.PENDING_DICE_ROLL);
    // //check if the game is over or complete
    // checkForGameOverOrComplete();
  }, [
    lastTurnSelectedOptions,
    dieValue,
    secondDieValue,
    setScore,
    isSelectionValid,
    gameState,
  ]);
  //function to determine if the game is over
  const isGameOver = useCallback(
    (dieValue, secondDieValue) => {
      const isSumAvailable = !selectedOptions.has(dieValue + secondDieValue);
      const isSelectingBothAvailable =
        dieValue !== secondDieValue &&
        !selectedOptions.has(dieValue) &&
        !selectedOptions.has(secondDieValue);
      return !isSumAvailable && !isSelectingBothAvailable;
    },
    [selectedOptions]
  );
  //const check if the game is over
  const checkForGameOverOrComplete = useCallback(() => {
    if (selectedOptions.size === 12) {
      setGameState(GAME_STATES.GAME_COMPLETE);

      return;
    }
  }, [selectedOptions, dieValue, secondDieValue, isGameOver, score, highScore]);

  //check if the game is over
  useEffect(() => {
    if (gameState === GAME_STATES.WAITING_For_RESPONSE) {
      if (isGameOver(dieValue, secondDieValue)) {
        onOpen();
        setGameState(GAME_STATES.GAME_OVER);
      }
    }
  }, [gameState, isGameOver, setGameState]);

  //sets the initial high score
  useEffect(() => {
    if (localStorage.getItem("highScore")) {
      setHighScore(localStorage.getItem("highScore"));
    }
  }, [setHighScore]);

  //sets the current score as high score if the game is over
  useEffect(() => {
    if (
      gameState === GAME_STATES.GAME_OVER ||
      gameState === GAME_STATES.GAME_COMPLETE
    ) {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("highScore", score);
      }
    }
  }, [gameState, setHighScore]);
  return (
    <>
      <div className="flex justify-center items-center h-full ">
        <Card className="flex-1  w-[95vw] md:w-full md:max-w-[70vw]">
          <CardHeader>
            <div className="flex justify-between items-center w-full px-4 flex-wrap gap-2">
              <h1 className="text-xl font-bold">Shut the Box</h1>
              <span className="font-bold">Score: {score}</span>
              <span className="font-bold">Highscore: {highScore}</span>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="flex flex-col gap-10 px-4 py-6  ">
              {/* <div className="flex flex-row gap-4 px-4 justify-center items-center flex-wrap"> */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-x-2 gap-y-4 w-full items-center">
                {Array.from({ length: 12 }).map((_, index) => {
                  const option = index + 1;
                  return (
                    <Button
                      size="md"
                      key={index}
                      isDisabled={selectedOptions.has(option)}
                      color={
                        lastTurnSelectedOptions.has(option)
                          ? "danger"
                          : "success"
                      }
                      onClick={() => handleOptionClick(option)}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
              <div className="w-full flex items-center justify-center">
                <ReactDice
                  numDice={2}
                  ref={reactDice}
                  rollDone={handleRollDice}
                  dotColor="#000"
                  faceColor="#fff"
                  outlineColor="#11141a"
                  outline={true}
                  rollTime={1.5}
                  disableIndividual={true}
                />
              </div>
              <p className="text-center italic">{displayMessage}</p>
            </div>
          </CardBody>
          <Divider />
          <CardFooter>
            <div className="flex items-center justify-center w-full">
              {/* START GAME BUTTON */}
              {gameState === GAME_STATES.NEW_GAME && (
                <Button color="primary" className="mx-auto" onClick={startGame}>
                  Start Game
                </Button>
              )}
              {/* ROLL DICE & SUBMIT BUTTONs */}
              {isGameOn && (
                <ButtonGroup>
                  <Button
                    onClick={rollDice}
                    color="primary"
                    isDisabled={
                      gameState === GAME_STATES.ROLLING_DICE ||
                      gameState === GAME_STATES.WAITING_For_RESPONSE
                    }
                  >
                    {gameState === GAME_STATES.ROLLING_DICE
                      ? "Rolling..."
                      : "Roll Dice"}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    color="primary"
                    isDisabled={
                      gameState !== GAME_STATES.WAITING_For_RESPONSE ||
                      !isSelectionValid
                    }
                  >
                    Submit
                  </Button>
                </ButtonGroup>
              )}
              {/* GAME OVER RESTART BUTTON */}

              {gameState === GAME_STATES.GAME_OVER && (
                <Button
                  color="danger"
                  className="mx-auto"
                  onClick={startGame}
                  disabled={gameState === GAME_STATES.ROLLING_DICE}
                >
                  Restart
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      <GameSuccessOverModal
        isOpen={isOpen}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
      />
    </>
  );
}

export default Game;
