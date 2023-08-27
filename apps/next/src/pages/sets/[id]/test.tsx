import React from "react";

import { HeadSeo } from "@quenti/components";

import { Container } from "@chakra-ui/react";

import { PageWrapper } from "../../../common/page-wrapper";
import { AuthedPage } from "../../../components/authed-page";
import { getLayout } from "../../../layouts/main-layout";
import { CreateTestData } from "../../../modules/create-test-data";
import HydrateSetData from "../../../modules/hydrate-set-data";
import { LoadingView } from "../../../modules/test/loading-view";
import { ResultsView } from "../../../modules/test/results-view";
import { TestView } from "../../../modules/test/test-view";
import { useTestContext } from "../../../stores/use-test-store";

const Test = () => {
  return (
    <AuthedPage>
      <HeadSeo title="Test" />
      <HydrateSetData disallowDirty>
        <CreateTestData>
          <TestContainer />
        </CreateTestData>
      </HydrateSetData>
    </AuthedPage>
  );
};

const TestContainer = () => {
  const result = useTestContext((s) => s.result);
  const submit = useTestContext((s) => s.submit);

  const [loading, setLoading] = React.useState(false);

  const onSubmit = () => {
    setLoading(true);
    setTimeout(
      () => {
        submit();
        setLoading(false);
      },
      Math.floor(Math.random() * 2000) + 2000,
    );
  };

  if (loading) return <LoadingView />;
  return (
    <Container maxW="4xl" mt={{ base: 0, md: 10 }}>
      {result ? <ResultsView /> : <TestView onSubmit={onSubmit} />}
    </Container>
  );
};

Test.PageWrapper = PageWrapper;
Test.getLayout = getLayout;

export default Test;
