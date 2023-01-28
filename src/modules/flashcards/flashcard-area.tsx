import React from "react";
import { FlashcardWrapper } from "../../components/flashcard-wrapper";
import { useSet } from "../../hooks/use-set";
import { useExperienceContext } from "../../stores/use-experience-store";
import { shuffleArray } from "../../utils/array";

export const FlashcardArea = () => {
  const { terms, termOrder: _termOrder } = useSet();

  const shuffle = useExperienceContext((s) => s.shuffleFlashcards);
  const [termOrder, setTermOrder] = React.useState<string[]>(
    shuffle ? shuffleArray(Array.from(_termOrder)) : _termOrder
  );

  React.useEffect(() => {
    setTermOrder((o: string[]) => (shuffle ? shuffleArray(Array.from(o)) : o));
  }, [shuffle]);

  return (
    <FlashcardWrapper
      h="calc(100vh - 240px)"
      terms={terms}
      termOrder={termOrder}
    />
  );
};