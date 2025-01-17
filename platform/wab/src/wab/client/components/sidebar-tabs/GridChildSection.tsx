import { observer } from "mobx-react-lite";
import React from "react";
import { spawn } from "../../../common";
import { parseGridChildCssProps } from "../../../shared/grid-utils";
import { FullRow, LabeledStyleItem } from "../sidebar/sidebar-helpers";
import { SidebarSection } from "../sidebar/SidebarSection";
import { DefinedIndicator } from "../style-controls/DefinedIndicator";
import {
  ExpsProvider,
  TplExpsProvider,
} from "../style-controls/StyleComponent";
import DimTokenSpinner from "../widgets/DimTokenSelector";

export const GridChildSection = observer(function GridChildSection(props: {
  expsProvider: ExpsProvider;
}) {
  const { expsProvider } = props;

  const childTpl =
    expsProvider instanceof TplExpsProvider ? expsProvider.tpl : undefined;

  if (!childTpl) {
    return null;
  }

  const studioCtx = expsProvider.studioCtx;

  const gridChildSpec = parseGridChildCssProps(expsProvider.mergedExp());

  const definedIndicators = [
    expsProvider.definedIndicator("grid-row-start"),
    expsProvider.definedIndicator("grid-row-end"),
    expsProvider.definedIndicator("grid-column-start"),
    expsProvider.definedIndicator("grid-column-end"),
  ];

  const handleChange = (prop: "row" | "column", dir: "start" | "end") => {
    return (val) => {
      spawn(
        studioCtx.change(({ success }) => {
          if (!val) {
            expsProvider.targetExp().clear(`grid-${prop}-${dir}`);
          } else {
            expsProvider
              .targetExp()
              .set(
                `grid-${prop}-${dir}`,
                `${dir === "end" ? "span " : ""}${+val}`
              );
          }

          return success();
        })
      );
    };
  };

  return (
    <SidebarSection
      title="Grid Child"
      isHeaderActive={true}
      definedIndicator={
        <DefinedIndicator label="GridChild" type={definedIndicators} />
      }
    >
      <FullRow>
        <LabeledStyleItem
          label={<div style={{ minWidth: 90 }}>Row</div>}
          styleName="grid-row"
        >
          <FullRow twinCols>
            <div className="flex flex-col flex-align-start">
              <DimTokenSpinner
                value={gridChildSpec.row.start ?? ""}
                onChange={handleChange("row", "start")}
                min={1}
                allowedUnits={[""]}
              />
              <span>Start</span>
            </div>
            <div className="flex flex-col flex-align-start">
              <DimTokenSpinner
                value={gridChildSpec.row.span ?? "1"}
                onChange={handleChange("row", "end")}
                min={1}
                noClear={true}
                allowedUnits={[""]}
              />
              <span>Span</span>
            </div>
          </FullRow>
        </LabeledStyleItem>
      </FullRow>
      <FullRow>
        <LabeledStyleItem
          label={<div style={{ minWidth: 90 }}>Column</div>}
          styleName="grid-column"
        >
          <FullRow twinCols>
            <div className="flex flex-col flex-align-start">
              <DimTokenSpinner
                value={gridChildSpec.column.start ?? ""}
                onChange={handleChange("column", "start")}
                min={1}
                allowedUnits={[""]}
              />
              <span>Start</span>
            </div>
            <div className="flex flex-col flex-align-start">
              <DimTokenSpinner
                value={gridChildSpec.column.span ?? "1"}
                onChange={handleChange("column", "end")}
                min={1}
                noClear={true}
                allowedUnits={[""]}
              />
              <span>Span</span>
            </div>
          </FullRow>
        </LabeledStyleItem>
      </FullRow>
    </SidebarSection>
  );
});
