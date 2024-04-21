"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Button, ButtonGroup } from "@nextui-org/button";

import React from "react";
import { CONSTANTS } from "./constants/index";
function getRandomItemFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function GameSuccessOverModal({ isOpen, onOpen, onOpenChange, hasWon }) {
  const [paragraph, setParagraph] = React.useState(
    hasWon
      ? getRandomItemFromArray(CONSTANTS.CONGRATULATION_MESSAGES)
      : getRandomItemFromArray(CONSTANTS.SASSY_MESSAGES)
  );
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {hasWon ? "Congratulations!" : "Game Over!"}
            </ModalHeader>
            <ModalBody>{paragraph}</ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                {hasWon ? "Play Again" : "Try Again"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default GameSuccessOverModal;
