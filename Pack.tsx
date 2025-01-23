import React, { FC, useMemo, useState } from "react";
/* @ts-ignore */
import * as d3 from "d3"; // eslint-disable-line import/no-extraneous-dependencies
import { ToolTips } from "./ToolTips";

const defaultStyle = {
    position: "absolute",
    top: 0,
    left: 0,
};

// const bgBarColor = "rgba(84, 112, 198, 0.1)";
// const orangeColor = "#fa8c16";

export const Pack: FC<any> = (props: any) => {
    const {
        width = 700,
        height = 700,
        marginTop = 40,
        marginLeft = 40,
        marginRight = 40,
        marginBottom = 40,
        style = {},
        x: tx = 0,
        y: ty = 0,
        data = {
            label: "label 1",
            // value: 100,
            Children: [
                {
                    label: "label 1",
                    value: 10,
                },
                {
                    label: "label 2",
                    value: 20,
                },
                {
                    label: "label 3",
                    value: 30,
                },
                {
                    label: "label 4",
                    value: 40,
                },
            ],
        },
        title = "Pack Chart",
    } = props;

    const [toolTipsProps, setToolTipsProps] = useState({
        visible: false,
        el: null,
    });

    const [hoverItem, setHoverItem] = useState<any>({});

    const root = useMemo(
        () =>
            d3
                .hierarchy(data)
                .sum((d: any) => d.value)
                .sort((a: any, b: any) => b.value - a.value),
        [data]
    );

    const colors = useMemo(() => d3.scaleOrdinal(d3.schemeCategory10), []);

    useMemo(
        () =>
            d3
                .pack()
                .size([
                    width - marginLeft - marginRight,
                    height - marginTop - marginBottom,
                ])
                .padding(3)(root),
        [root, width, height, marginLeft, marginRight, marginTop, marginBottom]
    );

    const rootDescendants = useMemo(() => root.descendants(), [root]);

    return (
        <svg
            width={width}
            height={height}
            style={{ ...defaultStyle, ...style }}
            transform={`translate(${tx},${ty})`}
            ref={props.compRef}
            className={props.className}
        >
            <g transform={`translate(${marginLeft},${marginTop})`}>
                {rootDescendants.map((d: any) => (
                    <g
                        key={d.data.label}
                        transform={`translate(${d.x},${d.y})`}
                        style={{ cursor: "pointer" }}
                        onPointerEnter={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();

                            setHoverItem(d);

                            setToolTipsProps({
                                visible: true,
                                el: e.target,
                            });
                        }}
                        onPointerLeave={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();

                            setHoverItem({});

                            setToolTipsProps({
                                visible: false,
                                el: null,
                            });
                        }}
                    >
                        <circle
                            r={d.r}
                            fill={colors(d.depth)}
                            fillOpacity={0.8}
                            stroke="none"
                        />
                        <text
                            fill={d.depth % 2 === 1 ? "white" : "black"}
                            textAnchor="middle"
                            fontSize={16 - d.depth * 4}
                            fontWeight={d.depth % 2 === 1 ? "bold" : "normal"}
                            transform={`translate(0,${d.depth % 2 === 1 ? -d.r + 10 : 5})`}
                        >
                            {d.data.label}
                        </text>
                    </g>
                ))}
            </g>
            <text
                fill="currentColor"
                textAnchor="middle"
                transform={`translate(${width / 2},${marginTop / 2})`}
            >
                {title}
            </text>
            <ToolTips {...toolTipsProps} width={180}>
                <div style={{ padding: 10 }}>
                    <div>label: {hoverItem.data?.label}</div>
                    <div>value: {hoverItem.value}</div>
                    {hoverItem.parent && (
                        <div>parent: {hoverItem.parent.data?.label}</div>
                    )}
                </div>
            </ToolTips>
        </svg>
    );
};
