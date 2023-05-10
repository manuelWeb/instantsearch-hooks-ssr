import Head from "next/head";
import React from "react";
import { GetServerSideProps } from "next";
import { renderToString } from "react-dom/server";
import algoliasearch from "algoliasearch/lite";
import { Hit as AlgoliaHit } from "instantsearch.js";
import {
  DynamicWidgets,
  InstantSearch,
  Hits,
  Highlight,
  RefinementList,
  SearchBox,
  InstantSearchServerState,
  InstantSearchSSRProvider,
} from "react-instantsearch-hooks-web";
import { getServerState } from "react-instantsearch-hooks-server";
import { createInstantSearchRouterNext } from "react-instantsearch-hooks-router-nextjs";
import singletonRouter, { useRouter } from "next/router";
import { Panel } from "../components/Panel";

const client = algoliasearch("2YYVBQESNN", "c2a5ba8bc1abfcd46ec7f06cd2811ee1");

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    price: number;
  }>;
};

function Hit({ hit }: HitProps) {
  return (
    <>
      <Highlight hit={hit} attribute="fiche.nom" className="Hit-label" />
      <span className="Hit-price">{hit.prix} €</span>
    </>
  );
}

type HomePageProps = {
  serverState?: InstantSearchServerState;
  url?: string;
};

export default function HomePage({ serverState, url }: HomePageProps) {
  const router = useRouter();
  // typeof window !== undefined && console.log(router);
  console.log(url);
  return (
    <InstantSearchSSRProvider {...serverState}>
      <Head>
        <title>React InstantSearch Hooks - Next.js</title>
      </Head>

      <InstantSearch
        searchClient={client}
        indexName="dev_TempsL_TLFR"
        routing={{
          router: createInstantSearchRouterNext({
            serverUrl: url,
            singletonRouter,
          }),
        }}
        insights={true}
      >
        <div className="Container" style={{ display: "flex" }}>
          {/* <div>
            <DynamicWidgets fallbackComponent={FallbackComponent} />
          </div> */}
          <div style={{ marginBottom: "32px" }}>
            {/* router:{JSON.stringify(singletonRouter)} */}
            <SearchBox />
          </div>

          <Hits hitComponent={Hit} />
        </div>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

function FallbackComponent({ attribute }: { attribute: string }) {
  return (
    <Panel header={attribute}>
      <RefinementList attribute={attribute} />
    </Panel>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> =
  async function getServerSideProps({ req }) {
    const protocol = req.headers.referer?.split("://")[0] || "https";
    const url = `${protocol}://${req.headers.host}${req.url}`;
    const serverState = await getServerState(<HomePage url={url} />, {
      renderToString,
    });
    console.log(renderToString);

    return {
      props: {
        serverState,
        url,
      },
    };
  };
