// This is a skeleton starter React component generated by Plasmic.
// This file is owned by you, feel free to edit as you see fit.
import { HTMLElementRefOf } from "@plasmicapp/react-web";
import * as React from "react";
import {
  ApiProject,
  RevalidatePlasmicHostingResponse,
} from "../../../../shared/ApiSchema";
import { DomainValidator } from "../../../../shared/hosting";
import { AppCtx } from "../../../app-ctx";
import { DefaultGitJobStepProps } from "../../../plasmic/plasmic_kit_continuous_deployment/PlasmicGitJobStep";
import {
  DefaultSubsectionPlasmicHostingProps,
  PlasmicSubsectionPlasmicHosting,
} from "../../../plasmic/plasmic_kit_continuous_deployment/PlasmicSubsectionPlasmicHosting";
import { reactConfirm } from "../../quick-modals";
import GitJobStep from "../../widgets/GitJobStep";
import PlasmicHostingSettings from "./PlasmicHostingSettings";
import { VisibleEnableBlock } from "./PublishFlowDialog";
import { TopBarModal } from "./TopBarModal";

export type SetupPlasmicHosting = {
  domains: string[];
};

export type StatusPlasmicHosting = {
  enabled: boolean;
  revalidateResult: DefaultGitJobStepProps["status"];
  revalidateResponse: RevalidatePlasmicHostingResponse | undefined;
};

export interface SubsectionPlasmicHostingProps
  extends DefaultSubsectionPlasmicHostingProps,
    VisibleEnableBlock {
  appCtx: AppCtx;
  project: ApiProject;
  refreshProjectAndPerms: () => void;
  setup: SetupPlasmicHosting;
  status?: StatusPlasmicHosting;
}

function SubsectionPlasmicHosting_(
  props: SubsectionPlasmicHostingProps,
  ref: HTMLElementRefOf<"div">
) {
  const {
    appCtx,
    project,
    refreshProjectAndPerms,
    setup,
    status,
    visible,
    enable,
    block,
    setVisibleEnableBlock,
    ...rest
  } = props;
  const domainValidator = new DomainValidator(
    appCtx.appConfig.plasmicHostingSubdomainSuffix
  );

  const [showHosting, setShowHosting] = React.useState(false);

  React.useEffect(() => {
    if (setup.domains.length > 0) {
      setVisibleEnableBlock(true, true, false);
    } else {
      setVisibleEnableBlock(visible, false, true);
    }
  }, [JSON.stringify(setup.domains)]);

  return (
    <>
      {showHosting && (
        <TopBarModal onClose={() => setShowHosting(false)}>
          <PlasmicHostingSettings
            project={project}
            refreshProjectAndPerms={refreshProjectAndPerms}
            onRemove={() => setVisibleEnableBlock(false, false, block)}
          />
        </TopBarModal>
      )}
      <PlasmicSubsectionPlasmicHosting
        root={{ ref, id: "plasmic-hosting-subsection" }}
        {...rest}
        warning={{
          wrap: (node) => project.hostUrl && node,
        }}
        checkbox={{
          props: {
            "aria-label": "Enable Plasmic hosting",
            isDisabled: block,
            isChecked: enable,
            onChange: (checked: boolean) =>
              setVisibleEnableBlock(visible, checked, block),
          },
        }}
        collapse={props.view !== "status" && !visible}
        domain={{
          children:
            domainValidator.extractCustomDomain(setup?.domains) ??
            domainValidator.extractSubdomain(setup?.domains) ??
            "",
          href: `https://${
            domainValidator.extractCustomDomain(setup?.domains) ??
            domainValidator.extractSubdomain(setup?.domains) ??
            ""
          }`,
          target: "_blank",
        }}
        setupButton={{
          onClick: () => {
            setShowHosting(true);
          },
        }}
        removeButton={{
          wrap: (node) => rest.view !== "status" && node,
          props: {
            onClick: async () => {
              if (
                await reactConfirm({
                  title: "Remove Plasmic-hosted publishing?",
                  message:
                    "This will stop deploying updates to the Plasmic-hosted website.",
                  confirmLabel: "Remove",
                })
              ) {
                await appCtx.api.setCustomDomainForProject(
                  undefined,
                  project.id
                );
                await appCtx.api.setSubdomainForProject(undefined, project.id);
                setVisibleEnableBlock(false, false, block);
              }
            },
          },
        }}
        steps={{
          children:
            status?.revalidateResult === "finished" ? (
              <>
                {status?.revalidateResponse?.successes.map((success) => (
                  <GitJobStep
                    status={"finished"}
                    description={
                      <>
                        Deployed to{" "}
                        <a target={"_blank"} href={`https://${success.domain}`}>
                          {success.domain}
                        </a>
                      </>
                    }
                  />
                ))}
                {status?.revalidateResponse?.failures.map((failure) => {
                  const explanation =
                    failure.error.type === "Cloudflare challenge"
                      ? "Blocked by Cloudflare challenge, please allow calls to /api/revalidate route on your domain or disable Cloudflare."
                      : failure.error.type === "Invalid JSON response"
                      ? "Unable to call /api/revalidate"
                      : "please retry later";
                  return (
                    <GitJobStep
                      status={"failed"}
                      description={`Failed deploy to ${failure.domain}: ${explanation}`}
                    />
                  );
                })}
              </>
            ) : (
              <GitJobStep
                status={status?.revalidateResult}
                description={"Deploying to Plasmic hosting"}
              />
            ),
        }}
      />
    </>
  );
}

const SubsectionPlasmicHosting = React.forwardRef(SubsectionPlasmicHosting_);
export default SubsectionPlasmicHosting;
