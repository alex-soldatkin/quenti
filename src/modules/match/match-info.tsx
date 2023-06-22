import {
  Box,
  Card,
  Container,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useMatchContext } from "../../stores/use-match-store";

export interface MatchStatProps {
  value: number | string;
  label: string;
}

export const MatchStat: React.FC<MatchStatProps> = ({ value, label }) => {
  const text = useColorModeValue("gray.600", "gray.400");

  return (
    <GridItem>
      <Stat>
        <StatLabel color={text} fontWeight={700}>
          {label}
        </StatLabel>
        <StatNumber
          fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
          fontFamily="Outfit"
          fontWeight={800}
        >
          {value}
        </StatNumber>
      </Stat>
    </GridItem>
  );
};

const MatchInfo = () => {
  const startTime = useMatchContext((s) => s.roundStartTime);
  const progress = useMatchContext((s) => s.roundProgress);
  const numTerms = useMatchContext((s) => s.termsThisRound);
  const completed = useMatchContext((s) => s.completed);

  const [seconds, setSeconds] = React.useState("0");

  useEffect(() => {
    const interval = setInterval(() => {
      if (completed) clearInterval(interval);
      else setSeconds(() => ((Date.now() - startTime) / 1000).toFixed(1));
    }, 100);
    return () => clearInterval(interval);
  }, [completed, startTime]);

  const bg = useColorModeValue("white", "gray.750");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Card
      bg={bg}
      rounded="lg"
      borderWidth="2px"
      borderBottomWidth="4px"
      borderTopWidth="0"
      borderColor={borderColor}
      w="300px"
      ml="7"
      overflow="hidden"
    >
      <Box
        bg="orange.300"
        height="1"
        style={{
          transition: "width 0.1s ease-in-out",
          width: `calc(100% * ${progress} / ${numTerms})`,
        }}
      />
      <Container py="5" px="6">
        <MatchStat label="Time" value={seconds} />
      </Container>
    </Card>
  );
};

export default MatchInfo;
