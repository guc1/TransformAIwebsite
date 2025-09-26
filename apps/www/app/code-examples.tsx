"use client";
import { StickyChat } from "@/components/ask";
import { PrimaryButton, SecondaryButton } from "@/components/button";
import { SectionTitle } from "@/components/section";
import type { LangIconProps } from "@/components/svg/lang-icons";
import {
  CurlIcon,
  EducationIcon,
  ElixirIcon,
  JavaIcon,
  PythonIcon,
  ResearchIcon,
  TSIcon,
} from "@/components/svg/lang-icons";
import { CodeEditor } from "@/components/ui/code-editor";
import { CopyCodeSnippetButton } from "@/components/ui/copy-code-button";
import { MeteorLines } from "@/components/ui/meteorLines";
import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { PrismTheme } from "prism-react-renderer";
import React, { useEffect } from "react";
import { useState } from "react";
const Tabs = TabsPrimitive.Root;
const ASK_CHAT_TRIGGER_ID = "ask-transformai-assistant-intro";
const ASK_CHAT_BOUNDARY_ID = "ask-transformai-assistant-boundary";

const editorTheme = {
  plain: {
    color: "#F8F8F2",
    backgroundColor: "#282A36",
  },
  styles: [
    {
      types: ["keyword"],
      style: {
        color: "#9D72FF",
      },
    },
    {
      types: ["function"],
      style: {
        color: "#FB3186",
      },
    },
    {
      types: ["string"],
      style: {
        color: "#3CEEAE",
      },
    },
    {
      types: ["string-property"],
      style: {
        color: "#9D72FF",
      },
    },
    {
      types: ["number"],
      style: {
        color: "#FB3186",
      },
    },
    {
      types: ["comment"],
      style: {
        color: "#4D4D4D",
      },
    },
  ],
} satisfies PrismTheme;

const typescriptCodeBlock = `import { verifyKey } from '@unkey/api';

const { result, error } = await verifyKey({
  apiId: "api_123",
  key: "xyz_123"
})

if ( error ) {
  // handle network error
}

if ( !result.valid ) {
  // reject unauthorized request
}

// handle request`;

const nextJsCodeBlock = `import { withUnkey } from '@unkey/nextjs';
export const POST = withUnkey(async (req) => {
  // Process the request here
  // You have access to the typed verification response using \`req.unkey\`
  console.log(req.unkey);
  return new Response('Your API key is valid!');
});`;

const nuxtCodeBlock = `export default defineEventHandler(async (event) => {
  if (!event.context.unkey.valid) {
    throw createError({ statusCode: 403, message: "Invalid API key" })
  }

  // return authorised information
  return {
    // ...
  };
});`;

const pythonCodeBlock = `import asyncio
import os
import unkey

async def main() -> None:
  client = unkey.Client(api_key=os.environ["API_KEY"])
  await client.start()

  result = await client.keys.verify_key("prefix_abc123")

 if result.is_ok:
   print(data.valid)
 else:
   print(result.unwrap_err())`;

const pythonFastAPICodeBlock = `import os
from typing import Any, Dict, Optional

import fastapi  # pip install fastapi
import unkey  # pip install unkey.py
import uvicorn  # pip install uvicorn

app = fastapi.FastAPI()


def key_extractor(*args: Any, **kwargs: Any) -> Optional[str]:
    if isinstance(auth := kwargs.get("authorization"), str):
        return auth.split(" ")[-1]

    return None


@app.get("/protected")
@unkey.protected(os.environ["UNKEY_API_ID"], key_extractor)
async def protected_route(
    *,
    authorization: str = fastapi.Header(None),
    unkey_verification: Any = None,
) -> Dict[str, Optional[str]]:
    assert isinstance(unkey_verification, unkey.ApiKeyVerification)
    assert unkey_verification.valid
    print(unkey_verification.owner_id)
    return {"message": "protected!"}


if __name__ == "__main__":
    uvicorn.run(app)
`;

const honoCodeBlock = `import { Hono } from "hono"
import { UnkeyContext, unkey } from "@unkey/hono";

const app = new Hono<{ Variables: { unkey: UnkeyContext } }>();
app.use("*", unkey());

app.get("/somewhere", (c) => {
  // access the unkey response here to get metadata of the key etc
  const unkey = c.get("unkey")
 return c.text("yo")
})`;

const tsRatelimitCodeBlock = `import { Ratelimit } from "@unkey/ratelimit"

const unkey = new Ratelimit({
  rootKey: process.env.UNKEY_ROOT_KEY,
  namespace: "my-app",
  limit: 10,
  duration: "30s",
  async: true
})

// elsewhere
async function handler(request) {
  const identifier = request.getUserId() // or ip or anything else you want

  const ratelimit = await unkey.limit(identifier)
  if (!ratelimit.success){
    return new Response("try again later", { status: 429 })
  }

  // handle the request here

}`;



const curlVerifyCodeBlock = `curl --request POST \\
  --url https://api.unkey.dev/v1/keys.verifyKey \\
  --header 'Content-Type: application/json' \\
  --data '{
    "apiId": "api_1234",
    "key": "sk_1234",
  }'`;

const curlCreateKeyCodeBlock = `curl --request POST \\
  --url https://api.unkey.dev/v1/keys.createKey \\
  --header 'Authorization: Bearer <UNKEY_ROOT_KEY>' \\
  --header 'Content-Type: application/json' \\
  --data '{
    "apiId": "api_123",
    "ownerId": "user_123",
    "expires": ${Date.now() + 7 * 24 * 60 * 60 * 1000},
    "ratelimit": {
      "type": "fast",
      "limit": 10,
      "duration": 60_000
    },
  }'`;

const curlRatelimitCodeBlock = `curl --request POST \
  --url https://api.unkey.dev/v1/ratelimits.limit \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '{
    "namespace": "email.outbound",
    "identifier": "user_123",
    "limit": 10,
    "duration": 60000,
    "async": true
}'`;

const elixirCodeBlock = `UnkeyElixirSdk.verify_key("xyz_AS5HDkXXPot2MMoPHD8jnL")
# returns
%{"valid" => true,
  "ownerId" => "chronark",
  "meta" => %{
    "hello" => "world"
  }}`;

const rustCodeBlock = `use unkey::models::{VerifyKeyRequest, Wrapped};
use unkey::Client;

async fn verify_key() {
    let api_key = env::var("UNKEY_API_KEY").expect("Environment variable UNKEY_API_KEY not found");
    let c = Client::new(&api_key);
    let req = VerifyKeyRequest::new("test_req", "api_458vdYdbwut5LWABzXZP3Z8jPVas");

    match c.verify_key(req).await {
        Wrapped::Ok(res) => println!("{res:?}"),
        Wrapped::Err(err) => eprintln!("{err:?}"),
    }
}`;

const javaVerifyKeyCodeBlock = `package com.example.myapp;
import com.unkey.unkeysdk.dto.KeyVerifyRequest;
import com.unkey.unkeysdk.dto.KeyVerifyResponse;

@RestController
public class APIController {

    private static IKeyService keyService = new KeyService();

    @PostMapping("/verify")
    public KeyVerifyResponse verifyKey(
        @RequestBody KeyVerifyRequest keyVerifyRequest) {
        // Delegate the creation of the key to the KeyService from the SDK
        return keyService.verifyKey(keyVerifyRequest);
    }
}`;

const javaCreateKeyCodeBlock = `package com.example.myapp;

import com.unkey.unkeysdk.dto.KeyCreateResponse;
import com.unkey.unkeysdk.dto.KeyCreateRequest;

@RestController
public class APIController {

    private static IKeyService keyService = new KeyService();

    @PostMapping("/createKey")
    public KeyCreateResponse createKey(
            @RequestBody KeyCreateRequest keyCreateRequest,
            @RequestHeader("Authorization") String authToken) {
        // Delegate the creation of the key to the KeyService from the SDK
        return keyService.createKey(keyCreateRequest, authToken);
    }
}

`;

type FrameworkLocalizedImage = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

type FrameworkImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  locale?: Record<string, FrameworkLocalizedImage>;
};

type Framework = {
  name: string;
  Icon: React.FC<LangIconProps>;
  codeBlock?: string;
  editorLanguage?: string;
  image?: FrameworkImage;
  contentKey?: string;
  href?: Record<string, string>;
};

type ProjectCopyFormatter = (key: string) => string;

const projectsNamespace = "CodeExamples.projects";

const resolveProjectMessage = (
  projectCopy: ProjectCopyFormatter,
  contentKey: string | undefined,
  suffix: string,
) => {
  if (!contentKey) {
    return undefined;
  }

  const messageKey = `${contentKey}.${suffix}`;

  try {
    const value = projectCopy(messageKey);
    const fallbackKey = `${projectsNamespace}.${messageKey}`;

    if (value === messageKey || value === fallbackKey) {
      return undefined;
    }

    return value;
  } catch (error) {
    return undefined;
  }
};

const languagesList = {
  Typescript: [
    {
      name: "Typescript",
      Icon: TSIcon,
      codeBlock: typescriptCodeBlock,
      editorLanguage: "tsx",
    },
    {
      name: "Next.js",
      Icon: TSIcon,
      codeBlock: nextJsCodeBlock,
      editorLanguage: "tsx",
    },
    {
      name: "Nuxt",
      codeBlock: nuxtCodeBlock,
      Icon: TSIcon,
      editorLanguage: "tsx",
    },
    {
      name: "Hono",
      Icon: TSIcon,
      codeBlock: honoCodeBlock,
      editorLanguage: "tsx",
    },
    {
      name: "Ratelimiting",
      Icon: TSIcon,
      codeBlock: tsRatelimitCodeBlock,
      editorLanguage: "tsx",
    },
  ],
  Python: [
    {
      name: "Python",
      Icon: PythonIcon,
      codeBlock: pythonCodeBlock,
      editorLanguage: "python",
    },
    {
      name: "FastAPI",
      Icon: PythonIcon,
      codeBlock: pythonFastAPICodeBlock,
      editorLanguage: "python",
    },
  ],
  Research: [
    {
      name: "AI adoption",
      Icon: ResearchIcon,
      image: {
        src: "/images/blog-images/mdxfilesforprojects/research/ai-adoptation/images/Maindisplay.png",
        alt: "Research dashboard illustrating AI adoption insights",
        width: 1200,
        height: 800,
      },
      contentKey: "researchAiAdoption",
      href: {
        en: "/blog/how-we-map-ai-adoption-across-industries",
        nl: "/blog/zo-meten-we-ai-adoptie-per-sector",
      },
    },
    {
      name: "Custom models",
      Icon: ResearchIcon,
      image: {
        src: "/images/blog-images/mdxfilesforprojects/research/LLM-Predictive-Capabilities/images/Custommodel.png",
        alt: "Graph visualizing return on investment for custom AI models",
        width: 1200,
        height: 800,
      },
      contentKey: "researchCustomModels",
      href: {
        en: "/blog/when-off-the-shelf-ai-falls-short-training-custom-models",
        nl: "/blog/wanneercustom",
      },
    },
    {
      name: "Time series",
      Icon: ResearchIcon,
      image: {
        src: "/images/blog-images/mdxfilesforprojects/research/aipredictions/images/coverpredict.png",
        alt: "Forecast chart generated by transformer models",
        width: 1200,
        height: 800,
      },
      contentKey: "researchTimeSeries",
      href: {
        en: "/blog/can-llms-forecast-time-exploring-ai-time-series-prediction",
        nl: "/blog/kunnen-llms-de-tijd-voorspellen-ai-voor-tijdreeksprognoses",
      },
    },
    {
      name: "AI ranking",
      Icon: ResearchIcon,
      image: {
        src: "/images/blog-images/mdxfilesforprojects/research/Chatbotranking/images/screenshotofchat.png",
        alt: "Chat interface ranking products within AI assistants",
        width: 1200,
        height: 800,
      },
      contentKey: "researchRanking",
      href: {
        en: "/blog/winning-the-model-ranking-higher-in-ai-recommendations",
        nl: "/blog/de-modelrace-winnen-hoger-scoren-in-ai-aanbevelingen",
      },
    },
  ],
  Java: [
    {
      name: "Verify key",
      Icon: JavaIcon,
      codeBlock: javaVerifyKeyCodeBlock,
      editorLanguage: "tsx",
    },
    {
      name: "Create key",
      Icon: JavaIcon,
      codeBlock: javaCreateKeyCodeBlock,
      editorLanguage: "tsx",
    },
  ],
  Elixir: [
    {
      name: "Verify key",
      Icon: ElixirIcon,
      codeBlock: elixirCodeBlock,
      editorLanguage: "tsx",
    },
  ],
  Education: [
    {
      name: "Education platform",
      Icon: EducationIcon,
      image: {
        src: "/images/blog-images/mdxfilesforprojects/education/educationapp/images/covereduapp.png",
        alt: "Dashboard of the TransformAI education platform",
        width: 1536,
        height: 1024,
      },
      contentKey: "educationPlatform",
      href: {
        en: "/blog/why-we-built-our-education-app-and-what-it-changed",
        nl: "/blog/waarom-we-onze-education-app-bouwden-en-wat-het-veranderde",
      },
    },
    {
      name: "Custom modules",
      Icon: EducationIcon,
      image: {
        src: "/images/blog-images/mdxfilesforprojects/education/modules/images/custommodules.png",
        alt: "Custom modules overview in the TransformAI education app",
        width: 1536,
        height: 1024,
        locale: {
          nl: {
            src: "/images/blog-images/mdxfilesforprojects/education/modules/images/custommodulesnl.png",
            alt: "Maatwerkmodules in de TransformAI-educatieapp",
          },
        },
      },
      contentKey: "educationCustomModules",
      href: {
        en: "/blog/custom-ai-learning-modules-with-built-in-co-teachers",
        nl: "/blog/maatwerk-ai-modules-met-ingebouwde-co-teachers",
      },
    },
    {
      name: "Educated 1,000+ people",
      Icon: EducationIcon,
      image: {
        src: "/images/blog-images/mdxfilesforprojects/education/people1000/images/thousendpeople.png",
        alt: "Overview of AI education impact across more than 1,000 learners",
        width: 1536,
        height: 1024,
        locale: {
          nl: {
            src: "/images/blog-images/mdxfilesforprojects/education/people1000/images/duizendmensen.png",
            alt: "Resultaten van AI-onderwijs voor meer dan 1.000 mensen",
          },
        },
      },
      contentKey: "educationScaling",
      href: {
        en: "/blog/scaling-ai-education-from-workshops-to-an-app",
        nl: "/blog/ai-onderwijs-opschalen-van-workshops-naar-een-app",
      },
    },
    {
      name: "Weekly updates",
      Icon: EducationIcon,
      image: {
        src: "/images/blog-images/mdxfilesforprojects/education/newsletter/images/newslettercover.png",
        alt: "Weekly AI updates newsletter cover",
        width: 1536,
        height: 1024,
        locale: {
          nl: {
            src: "/images/blog-images/mdxfilesforprojects/education/newsletter/images/newslettercovernl.png",
            alt: "Omslag van de wekelijkse AI-update nieuwsbrief",
          },
        },
      },
      contentKey: "educationNewsletter",
      href: {
        en: "/blog/weekly-ai-updates-beginner-to-advanced-with-follow-ups",
        nl: "/blog/wekelijkse-ai-updates-van-beginner-tot-gevorderd-met-follow-ups",
      },
    },
  ],
  Curl: [
    {
      name: "Verify key",
      Icon: CurlIcon,
      codeBlock: curlVerifyCodeBlock,
      editorLanguage: "tsx",
    },
    {
      name: "Create key",
      Icon: CurlIcon,
      codeBlock: curlCreateKeyCodeBlock,
      editorLanguage: "tsx",
    },
    {
      name: "Ratelimit",
      Icon: CurlIcon,
      codeBlock: curlRatelimitCodeBlock,
      editorLanguage: "tsx",
    },
  ],
} as const satisfies {
  [key: string]: Framework[];
};

// const TabsContent = React.forwardRef<
//   React.ElementRef<typeof TabsPrimitive.Content>,
//   React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
// >(({ className, ...props }, ref) => (
//   <TabsPrimitive.Content
//     ref={ref}
//     className={cn(
//       "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
//       className,
//     )}
//     {...props}
//   />
// ));
// TabsContent.displayName = TabsPrimitive.Content.displayName;

type Props = {
  className?: string;
};
type Language =
  | "Typescript"
  | "Python"
  | "Education"
  | "Research"
  | "Curl"
  | "Elixir"
  | "Java";
type LanguagesList = {
  name: Language;
  Icon: React.FC<LangIconProps>;
};
const languages = [
  { name: "Typescript", Icon: TSIcon },
  { name: "Python", Icon: PythonIcon },
  { name: "Education", Icon: EducationIcon },
  { name: "Research", Icon: ResearchIcon },
  { name: "Curl", Icon: CurlIcon },
  { name: "Elixir", Icon: ElixirIcon },
  { name: "Java", Icon: JavaIcon },
] as LanguagesList[];

// TODO extract this automatically from our languages array
type FrameworkName = (typeof languagesList)[Language][number]["name"];

const LanguageTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, value, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    value={value}
    className={cn(
      "inline-flex items-center gap-1 justify-center whitespace-nowrap rounded-t-lg px-3  py-1.5 text-sm transition-all hover:text-white/80 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-t from-black to-black data-[state=active]:from-white/10 border border-b-0 text-white/30 data-[state=active]:text-white border-[#454545] font-light",
      className,
    )}
    {...props}
  />
));

LanguageTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const CodeExamples: React.FC<Props> = ({ className }) => {
  const t = useTranslations("CodeExamples");
  const cta = useTranslations("CTA");
  const projectCopy = useTranslations("CodeExamples.projects");
  const [language, setLanguage] = useState<Language>("Typescript");
  const [framework, setFramework] = useState<FrameworkName>("Typescript");
  const [languageHover, setLanguageHover] = useState("Typescript");
  const frameworksForLanguage: Framework[] = languagesList[language];
  const currentFrameworkData: Framework | undefined =
    frameworksForLanguage.find((f) => f.name === framework) ??
    frameworksForLanguage[0];
  const activeCodeBlock = currentFrameworkData?.codeBlock ?? "";
  const activeEditorLanguage = currentFrameworkData?.editorLanguage ?? "tsx";

  useEffect(() => {
    const [firstFramework] = languagesList[language];
    if (firstFramework) {
      setFramework(firstFramework.name);
    }
  }, [language]);

  return (
    <section className={className}>
      <SectionTitle
        id={ASK_CHAT_TRIGGER_ID}
        title={t("top.title")}
        text={t("top.text")}
        align="center"
        className="relative"
      >
        <div className="absolute bottom-32 left-[-50px]">
          <MeteorLines className="ml-2 fade-in-0" delay={3} number={1} />
          <MeteorLines className="ml-10 fade-in-40" delay={0} number={1} />
          <MeteorLines className="ml-16 fade-in-100" delay={5} number={1} />
        </div>
        <div className="absolute bottom-32 right-[200px]">
          <MeteorLines className="ml-2 fade-in-0" delay={4} number={1} />
          <MeteorLines className="ml-10 fade-in-40" delay={0} number={1} />
          <MeteorLines className="ml-16 fade-in-100" delay={2} number={1} />
        </div>
      </SectionTitle>
      <StickyChat
        className="mt-16"
        triggerId={ASK_CHAT_TRIGGER_ID}
        boundaryId={ASK_CHAT_BOUNDARY_ID}
      />
      <SectionTitle
        id={ASK_CHAT_BOUNDARY_ID}
        title={t("bottom.title")}
        text={t("bottom.text")}
        align="center"
        className="relative mt-24"
      />
      <div className="relative w-full mt-10 rounded-4xl border-[.75px] border-white/10 bg-gradient-to-b from-[#111111] to-black border-t-[.75px] border-t-white/20">
        <div
          aria-hidden
          className="absolute pointer-events-none inset-x-16 h-[432px] bottom-[calc(100%-2rem)] bg-[radial-gradient(94.69%_94.69%_at_50%_100%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0)_55.45%)]"
        />
        <Tabs
          defaultValue={language}
          onValueChange={(l) => setLanguage(l as Language)}
          className="relative flex items-end h-16 px-4 border rounded-tr-3xl rounded-tl-3xl border-white/10 editor-top-gradient"
        >
          <TabsPrimitive.List className="flex items-end gap-4 overflow-x-auto scrollbar-hidden">
            {languages.map(({ name, Icon }) => (
              <LanguageTrigger
                key={name}
                onMouseEnter={() => setLanguageHover(name)}
                onMouseLeave={() => setLanguageHover(language)}
                value={name}
              >
                <Icon active={languageHover === name || language === name} />
                {name}
              </LanguageTrigger>
            ))}
          </TabsPrimitive.List>
        </Tabs>
        <div className="flex flex-col sm:flex-row overflow-x-auto scrollbar-hidden sm:h-[520px]">
          <FrameworkSwitcher
            frameworks={frameworksForLanguage}
            currentFramework={framework}
            setFramework={setFramework}
            projectCopy={projectCopy}
          />
          <div
            className={cn(
              "relative flex w-full pt-4 pb-8 pl-8 pr-8 text-white",
              currentFrameworkData?.image
                ? "flex-col gap-8 lg:flex-row lg:items-center"
                : "font-mono text-xs sm:text-sm",
            )}
          >
            {currentFrameworkData?.image ? (
              <ProjectShowcase
                image={currentFrameworkData.image}
                contentKey={currentFrameworkData.contentKey}
                language={language}
                projectCopy={projectCopy}
                hrefs={currentFrameworkData.href}
              />
            ) : (
              <>
                <CodeEditor
                  language={activeEditorLanguage}
                  theme={editorTheme}
                  codeBlock={activeCodeBlock}
                />
                <CopyCodeSnippetButton
                  textToCopy={activeCodeBlock}
                  className="absolute hidden cursor-pointer top-5 right-5 lg:flex"
                />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
        <Link key="get-started" href="https://app.unkey.com">
          <PrimaryButton
            shiny
            label={cta("getStarted")}
            IconRight={ChevronRight}
          />
        </Link>
        <Link key="explore-projects" href="/docs">
          <SecondaryButton
            label={cta("exploreProjects")}
            IconRight={ChevronRight}
          />
        </Link>
      </div>
    </section>
  );
};

function ProjectShowcase({
  image,
  contentKey,
  language,
  projectCopy,
  hrefs,
}: {
  image: NonNullable<Framework["image"]>;
  contentKey?: string;
  language: Language;
  projectCopy: ProjectCopyFormatter;
  hrefs?: Framework["href"];
}) {
  const locale = useLocale();

  const localizedImage = image.locale?.[locale];
  const imageSrc = localizedImage?.src ?? image.src;
  const imageAlt = localizedImage?.alt ?? image.alt;
  const imageWidth = localizedImage?.width ?? image.width;
  const imageHeight = localizedImage?.height ?? image.height;

  const title = resolveProjectMessage(projectCopy, contentKey, "title");
  const description = resolveProjectMessage(
    projectCopy,
    contentKey,
    "description",
  );
  const result = resolveProjectMessage(projectCopy, contentKey, "result");
  const cta = resolveProjectMessage(projectCopy, contentKey, "cta");
  const field = resolveProjectMessage(projectCopy, contentKey, "field");
  const name = resolveProjectMessage(projectCopy, contentKey, "name");

  const href = hrefs
    ? hrefs[locale] ?? hrefs.en ?? Object.values(hrefs)[0]
    : undefined;

  return (
    <div className="flex flex-col w-full gap-8 lg:flex-row lg:items-center">
      <div className="flex justify-start w-full lg:flex-1">
        <div className="relative w-full max-w-[720px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            className="h-full w-full object-contain"
            sizes="(min-width: 1280px) 720px, (min-width: 640px) 70vw, 90vw"
            priority={language === "Education" || language === "Research"}
          />
        </div>
      </div>
      {(title || description || result || cta) && (
        <div className="flex flex-col justify-center gap-4 text-white/80 lg:max-w-sm">
          {field || name ? (
            <div className="flex flex-col gap-1">
              {field ? (
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  {field}
                </span>
              ) : null}
              {name ? (
                <span className="text-sm font-medium text-white/70">
                  {name}
                </span>
              ) : null}
            </div>
          ) : null}
          {title ? (
            <h3 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="text-sm leading-relaxed text-white/80">
              {description}
            </p>
          ) : null}
          {result ? (
            <p className="text-sm leading-relaxed text-white/80">
              {result}
            </p>
          ) : null}
          {cta ? (
            href ? (
              <Link
                href={href}
                className="inline-flex items-center justify-center self-start px-5 py-2 text-sm font-semibold text-black transition-colors duration-200 bg-white rounded-lg shadow-sm hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {cta}
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center self-start px-5 py-2 text-sm font-semibold text-black transition-colors duration-200 bg-white rounded-lg shadow-sm">
                {cta}
              </span>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}

function FrameworkSwitcher({
  frameworks,
  currentFramework,
  setFramework,
  projectCopy,
}: {
  frameworks: Framework[];
  currentFramework: FrameworkName;
  setFramework: React.Dispatch<React.SetStateAction<FrameworkName>>;
  projectCopy: ProjectCopyFormatter;
}) {
  const getLabel = (framework: Framework) => {
    return (
      resolveProjectMessage(projectCopy, framework.contentKey, "label") ??
      framework.name
    );
  };

  const getField = (framework: Framework) => {
    return resolveProjectMessage(projectCopy, framework.contentKey, "field");
  };

  return (
    <div className="flex flex-col border-b border-white/5 px-4 py-5 text-white sm:w-[232px] sm:border-b-0 sm:border-r sm:border-white/10">
      <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-col sm:gap-2 sm:overflow-visible">
        {frameworks.map((framework) => (
          <button
            key={framework.name}
            type="button"
            onClick={() => {
              setFramework(framework.name as FrameworkName);
            }}
            className={cn(
              "group flex min-w-[200px] flex-1 cursor-pointer flex-col items-start gap-1 rounded-xl border border-transparent bg-white/0 px-4 py-3 text-left text-sm transition duration-200 sm:min-w-0",
              {
                "bg-white/10 text-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] border-white/20":
                  currentFramework === framework.name,
                "text-white/40 hover:border-white/15 hover:bg-white/5":
                  currentFramework !== framework.name,
              },
            )}
          >
            {(() => {
              const field = getField(framework);

              return field ? (
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">
                  {field}
                </span>
              ) : null;
            })()}
            <span className="text-sm font-medium leading-snug text-inherit">
              {getLabel(framework)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
