import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { Loading } from "../components/loading";
import { queryEventChannel } from "../events/query";
import { useFeature } from "../hooks/use-feature";
import { EnabledFeature } from "../server/api/common/constants";
import {
  ContainerContext,
  createContainerStore,
  type ContainerStore,
  type ContainerStoreProps,
} from "../stores/use-container-store";
import { useSetPropertiesStore } from "../stores/use-set-properties-store";
import { api, type RouterOutputs } from "../utils/api";
import type { Widen } from "../utils/widen";
import { Set404 } from "./main/set-404";
import { SetPrivate } from "./main/set-private";

type AuthedReturn = RouterOutputs["studySets"]["byId"];
type BaseReturn = Widen<AuthedReturn | RouterOutputs["studySets"]["getPublic"]>;
type StudiableType = AuthedReturn["container"]["studiableTerms"][number];
export type SetData = BaseReturn & {
  authed: boolean;
  injected?: {
    studiableLearnTerms: StudiableType[];
    studiableFlashcardTerms: StudiableType[];
  };
};
export type AuthedData = AuthedReturn & {
  authed: boolean;
  injected: {
    studiableLearnTerms: StudiableType[];
    studiableFlashcardTerms: StudiableType[];
  };
};

export interface HydrateSetDataProps {
  disallowDirty?: boolean;
  requireFresh?: boolean;
  allowEmpty?: boolean;
}

export const HydrateSetData: React.FC<
  React.PropsWithChildren<HydrateSetDataProps>
> = ({ disallowDirty = false, requireFresh, allowEmpty = false, children }) => {
  const { status } = useSession();
  const id = useRouter().query.id as string;
  const [isDirty, setIsDirty] = useSetPropertiesStore((s) => [
    s.isDirty,
    s.setIsDirty,
  ]);

  const queryKey = status == "authenticated" ? "byId" : "getPublic";
  const { data, error, refetch, isFetchedAfterMount } = (
    api.studySets[queryKey] as typeof api.studySets.byId
  ).useQuery(id, {
    retry: false,
    enabled: !!id && !isDirty,
    onSuccess: (data) => {
      if (isDirty) setIsDirty(false);
      queryEventChannel.emit("setQueryRefetched", createInjectedData(data));
    },
  });

  React.useEffect(() => {
    void (async () => {
      if (isDirty) await refetch();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  const createInjectedData = (data: BaseReturn): SetData => {
    if (!data.container) return { ...data, authed: false };

    const studiableLearnTerms = data.container.studiableTerms.filter(
      (t) => t.mode == "Learn"
    );
    const studiableFlashcardTerms = data.container.studiableTerms.filter(
      (t) => t.mode == "Flashcards"
    );
    return {
      ...data,
      authed: true,
      injected: {
        studiableLearnTerms,
        studiableFlashcardTerms,
      },
    };
  };

  if (error?.data?.httpStatus == 404) return <Set404 />;
  if (error?.data?.httpStatus == 403) return <SetPrivate />;
  if (
    (!allowEmpty && !data) ||
    (disallowDirty && isDirty) ||
    (!isFetchedAfterMount && requireFresh)
  )
    return <Loading />;

  return (
    <ContextLayer data={data ? createInjectedData(data) : undefined}>
      <Head>
        <title>{data?.title} | Quizlet.cc</title>
      </Head>
      {children}
    </ContextLayer>
  );
};

interface ContextLayerProps {
  data?: SetData;
}

interface SetContextProps {
  data?: SetData;
}

export const SetContext = React.createContext<SetContextProps | undefined>(
  undefined
);

const ContextLayer: React.FC<React.PropsWithChildren<ContextLayerProps>> = ({
  data,
  children,
}) => {
  const { status } = useSession();
  const extendedFeedbackBank = useFeature(EnabledFeature.ExtendedFeedbackBank);

  const getVal = (data: AuthedData): Partial<ContainerStoreProps> => ({
    shuffleFlashcards: data.container.shuffleFlashcards,
    shuffleLearn: data.container.shuffleLearn,
    studyStarred: data.container.studyStarred,
    answerWith: data.container.answerWith,
    starredTerms: data.container.starredTerms,
    multipleAnswerMode: data.container.multipleAnswerMode,
    extendedFeedbackBank:
      data.container.extendedFeedbackBank && extendedFeedbackBank,
    enableCardsSorting: data.container.enableCardsSorting,
    cardsStudyStarred: data.container.cardsStudyStarred,
    cardsAnswerWith: data.container.cardsAnswerWith,
    matchStudyStarred: data.container.matchStudyStarred,
  });

  const storeRef = React.useRef<ContainerStore>();
  if (!storeRef.current) storeRef.current = createContainerStore(undefined);

  React.useEffect(() => {
    if (status == "authenticated" && data)
      storeRef.current?.setState(getVal(data as AuthedData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  React.useEffect(() => {
    const trigger = (data: SetData) => {
      if (status == "authenticated")
        storeRef.current?.setState(getVal(data as AuthedData));
    };

    queryEventChannel.on("setQueryRefetched", trigger);
    return () => {
      queryEventChannel.off("setQueryRefetched", trigger);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SetContext.Provider value={{ data }}>
      <ContainerContext.Provider value={storeRef.current}>
        {children}
      </ContainerContext.Provider>
    </SetContext.Provider>
  );
};
