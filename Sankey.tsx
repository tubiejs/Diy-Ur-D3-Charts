/* eslint-disable import/no-extraneous-dependencies */
import React, { FC, useCallback, useMemo, useState } from "react";
/* @ts-ignore */
import * as d3 from "d3";
import {
    sankey as d3Sankey,
    sankeyLinkHorizontal as d3SankeyLinkHorizontal,
    /* @ts-ignore */
} from "d3-sankey";
import { ToolTips } from "./ToolTips";

const defaultStyle = {
    position: "absolute",
    top: 0,
    left: 0,
};

// const bgBarColor = "rgba(84, 112, 198, 0.1)";
// const orangeColor = "#fa8c16";

export const Sankey: FC<any> = (props: any) => {
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
            nodes: [
                {
                    label: "label 11",
                    category: "category 1",
                },
                {
                    label: "label 12",
                    category: "category 1",
                },
                {
                    label: "label 21",
                    category: "category 2",
                },
                {
                    label: "label 22",
                    category: "category 2",
                },
            ],
            links: [
                {
                    source: "label 11",
                    target: "label 12",
                    value: 122,
                },
                {
                    source: "label 11",
                    target: "label 21",
                    value: 34,
                },
                {
                    source: "label 11",
                    target: "label 22",
                    value: 445,
                },
                {
                    source: "label 12",
                    target: "label 21",
                    value: 99,
                },
                {
                    source: "label 12",
                    target: "label 22",
                    value: 343,
                },
            ],
        },
        title = "Sankey Chart",
    } = props;

    const [toolTipsProps, setToolTipsProps] = useState({
        visible: false,
        el: null,
    });

    const [hoverItem, setHoverItem] = useState<any>({});

    const sankey = useMemo(
        () =>
            d3Sankey()
                .nodeId((d: any) => d.label)
                .nodeAlign((d: any) => d.depth)
                .nodeWidth(15)
                .nodePadding(10)
                .extent([
                    [marginLeft, marginTop],
                    [width - marginRight - marginLeft, height - marginBottom - marginTop],
                ]),
        [marginLeft, marginTop, width, height, marginRight, marginBottom]
    );

    const { nodes, links } = useMemo(() => {
        const _links = data.links.map((d: any) => ({
            ...d,
        }));

        const _nodes = data.nodes.map((d: any) => ({
            ...d,
        }));

        return sankey({
            nodes: _nodes,
            links: _links,
        });
    }, [data.nodes, data.links, sankey]);

    const colors = useMemo(() => d3.scaleOrdinal(d3.schemeCategory10), []);

    const sankeyLinkHorizontal = useMemo(() => d3SankeyLinkHorizontal(), []);

    const getLinkOpacity = useCallback(
        (d: any) => {
            if (!hoverItem.sourceLinks) {
                return 1;
            }

            if (hoverItem.sourceLinks.includes(d)) {
                return 1;
            }

            if (hoverItem.targetLinks.includes(d)) {
                return 1;
            }

            return 0.2;
        },
        [hoverItem]
    );

    const renderHoverItem = useMemo(() => {
        let type = "";

        if (hoverItem.source) {
            type = "link";
        } else if (hoverItem.sourceLinks) {
            type = "node";
        }

        if (!type) {
            return null;
        }

        if (type === "node") {
            const _links = hoverItem.sourceLinks.length
                ? hoverItem.sourceLinks
                : hoverItem.targetLinks;

            return (
                <>
                    <div>{`${hoverItem.category}: ${hoverItem.label} ${hoverItem.value}`}</div>
                    {_links.map((d: any, i: number) => (
                        <div
                            key={`${d.source.category}-${d.source.label}-${d.target.category}-${d.target.label}`}
                            style={{
                                color: "#fff",
                                fontSize: 14,
                                backgroundColor: d3.rgb(colors(i)).darker(0.8).toString(),
                                marginTop: 2,
                                borderRadius: 4,
                                padding: "0 5px",
                            }}
                        >
                            {`${d.source.label === hoverItem.label
                                    ? d.target.label
                                    : d.source.label
                                } ${d.value} ${((d.value * 100) / hoverItem.value).toFixed(2)}%`}
                        </div>
                    ))}
                </>
            );
        }

        if (type === "link") {
            return (
                <>
                    <div>{`${hoverItem.source.category}: ${hoverItem.source.label}`}</div>
                    <div>{`${hoverItem.target.category}: ${hoverItem.target.label}`}</div>
                    <div>{hoverItem.value}</div>
                </>
            );
        }

        return null;
    }, [hoverItem, colors]);

    return (
        <svg
            width={width}
            height={height}
            style={{ ...defaultStyle, ...style }}
            transform={`translate(${tx},${ty})`}
            ref={props.compRef}
            className={props.className}
        >
            <g transform={`translate(${marginLeft / 2},${marginTop})`}>
                {nodes.map((d: any) => (
                    <g
                        key={`${d.category}-${d.label}`}
                        transform={`translate(${d.x0},${d.y0})`}
                        className="d3-sankey-node"
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
                        <rect
                            width={d.x1 - d.x0}
                            height={d.y1 - d.y0}
                            fill={colors(d.category)}
                            stroke="currentColor"
                        />
                        <text
                            fill="currentColor"
                            textAnchor="end"
                            transform={`translate(0,${(d.y1 - d.y0) / 2})`}
                            fontSize={12}
                        >
                            {d.label}
                        </text>
                    </g>
                ))}
                <g fill="none" strokeOpacity={0.5}>
                    {links.map((d: any) => (
                        <g
                            key={`${d.source.label}-${d.target.label}`}
                            className="d3-sankey-link"
                            style={{
                                mixBlendMode: "multiply",
                                cursor: "pointer",
                                opacity: getLinkOpacity(d),
                            }}
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
                            <linearGradient
                                id={`linear-gradient-${d.source.label}-${d.target.label}`}
                                x1={d.source.x1}
                                x2={d.target.x0}
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0%" stopColor={colors(d.source.category)} />
                                <stop offset="100%" stopColor={colors(d.target.category)} />
                            </linearGradient>
                            <path
                                d={sankeyLinkHorizontal(d)}
                                fill="none"
                                stroke={`url(#linear-gradient-${d.source.label}-${d.target.label})`}
                                strokeWidth={Math.max(1, d.width)}
                            />
                        </g>
                    ))}
                </g>
            </g>
            <text
                fill="currentColor"
                textAnchor="middle"
                transform={`translate(${width / 2},${marginTop})`}
            >
                {title}
            </text>
            <ToolTips {...toolTipsProps} width={200}>
                <div style={{ padding: 10, color: "#fff" }}>{renderHoverItem}</div>
            </ToolTips>
        </svg>
    );
};
