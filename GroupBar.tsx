import React, { FC, useRef, useEffect, useMemo, useState } from "react";
/* @ts-ignore */
import * as d3 from "d3"; // eslint-disable-line import/no-extraneous-dependencies
import { ToolTips } from "./ToolTips";

const defaultStyle = {
    position: "absolute",
    top: 0,
    left: 0,
};

const bgBarColor = "rgba(84, 112, 198, 0.1)";
// const orangeColor = "#fa8c16";

export const GroupBar: FC<any> = (props: any) => {
    const {
        width = 400,
        height = 400,
        marginTop = 40,
        marginRight = 40,
        marginBottom = 40,
        marginLeft = 40,
        style = {},
        x: tx = 0,
        y: ty = 0,
        data = {
            minY: -1000,
            maxY: 1000,
            values: [
                [-155, 200, -114, 234],
                [50, 210, 314, 234],
                [175, -230, 414, -334],
                [185, 260, -514, 353],
                [-195, 290, 714, 512],
                [155, 500, 814, 754],
            ],
        },
        labels = ["2019", "2020", "2021", "2022", "2023", "2024"],
        subLabels = ["Season 1", "Season 2", "Season 3", "Season 4"],
        colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b"],
        title = "GroupBar Chart",
        xLabel = "X Axis",
        yLabel = "Y Axis",
    } = props;

    const [toolTipsProps, setToolTipsProps] = useState({
        visible: false,
        el: null,
    });

    const [hoverItem, setHoverItem] = useState({
        label: "",
        value: [],
    });

    const [barsVisible, setBarsVisible] = useState(subLabels.map(() => true));

    const gx = useRef<any>();
    const gy = useRef<any>();

    const mainX = useMemo(
        () =>
            d3
                .scaleBand(labels, [marginLeft, width - marginRight])
                .paddingInner(0.15),
        [labels, width, marginLeft, marginRight]
    );

    const subX = useMemo(
        () => d3.scaleBand(subLabels, [0, mainX.bandwidth()]).paddingInner(0.05),
        [subLabels, mainX]
    );

    const y = useMemo(
        () =>
            d3.scaleLinear(
                [data.maxY, data.minY],
                [marginTop, height - marginBottom]
            ),
        [data, height, marginBottom, marginTop]
    );

    const yTicks = useMemo(() => y.ticks(), [y]);

    const bgBarHeight = useMemo(
        () => Math.abs(y(yTicks[0]) - y(yTicks[1])),
        [y, yTicks]
    );

    const mainWidth = useMemo(() => mainX.bandwidth(), [mainX]);

    const subBarWidth = useMemo(() => subX.bandwidth(), [subX]);

    useEffect(() => {
        d3.select(gx.current).call(d3.axisBottom(mainX));
    }, [gx, mainX]);

    useEffect(() => {
        d3.select(gy.current).call(d3.axisLeft(y));
    }, [gy, y]);

    return (
        <svg
            width={width}
            height={height}
            style={{ ...defaultStyle, ...style }}
            transform={`translate(${tx},${ty})`}
            ref={props.compRef}
            className={props.className}
        >
            <g>
                {yTicks.map((d: any, i: any) => (
                    <rect
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        x={marginLeft}
                        y={y(d)}
                        width={width - marginRight - marginLeft}
                        height={bgBarHeight}
                        fill={i % 2 === 0 ? "transparent" : "#eee"}
                    />
                ))}
            </g>
            <g ref={gx} transform={`translate(0,${y(0)})`} />
            <g ref={gy} transform={`translate(${marginLeft},0)`} />
            <g>
                {data.values.map((d: any, i: any) => (
                    <g
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        transform={`translate(${mainX(labels[i])},0)`}
                        style={{ cursor: "pointer" }}
                        onPointerEnter={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();

                            setHoverItem({
                                label: labels[i],
                                value: d,
                            });

                            setToolTipsProps({
                                visible: true,
                                el: e.target,
                            });
                        }}
                        onPointerLeave={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();

                            setToolTipsProps({
                                visible: false,
                                el: null,
                            });
                        }}
                    >
                        <rect
                            // eslint-disable-next-line react/no-array-index-key
                            key={`bar${i}`}
                            x={0}
                            y={marginTop}
                            width={mainWidth}
                            height={height - marginBottom - marginTop}
                            fill={bgBarColor}
                        />
                        {d.map((subD: any, subI: any) => (
                            <rect
                                // eslint-disable-next-line react/no-array-index-key
                                key={subI}
                                x={subX(subLabels[subI])}
                                y={subD > 0 ? y(subD) : y(0)}
                                width={subBarWidth}
                                height={Math.abs(y(subD) - y(0))}
                                fill={barsVisible[subI] ? colors[subI] : "transparent"}
                            />
                        ))}
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
            <text
                fill="currentColor"
                textAnchor="end"
                transform={`translate(${width - marginRight},${height - 20})`}
            >
                {xLabel}
            </text>
            <text
                fill="currentColor"
                textAnchor="start"
                transform={`translate(${marginLeft},${marginTop})`}
            >
                {yLabel}
            </text>
            <g transform={`translate(${marginLeft},${height - marginBottom + 5})`}>
                {/* legends */}
                {subLabels.map((d: any, i: any) => (
                    <g
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        transform={`translate(${i * 60},0)`}
                        style={{ cursor: "pointer" }}
                        onPointerEnter={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();

                            const newBarsVisible = barsVisible.map(() => false);
                            newBarsVisible[i] = true;

                            setBarsVisible(newBarsVisible);
                        }}
                        onPointerLeave={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();

                            setBarsVisible(barsVisible.map(() => true));
                        }}
                    >
                        <rect width={60} height={10} fill={colors[i]} />
                        <text x={5} y={20} fill={colors[i]} fontSize={12}>
                            {d}
                        </text>
                    </g>
                ))}
            </g>
            <ToolTips {...toolTipsProps} width={180}>
                <div style={{ padding: 10, color: "#fff" }}>
                    <div>{hoverItem.label}</div>
                    <div style={{ marginTop: 5 }}>
                        {hoverItem.value.map((d: any, i: any) => (
                            <div
                                // eslint-disable-next-line react/no-array-index-key
                                key={i}
                                style={{
                                    color: "#fff",
                                    fontSize: 14,
                                    backgroundColor: colors[i],
                                    marginTop: 2,
                                    borderRadius: 4,
                                    padding: "0 5px",
                                }}
                            >
                                {subLabels[i]}: {d}
                            </div>
                        ))}
                    </div>
                </div>
            </ToolTips>
        </svg>
    );
};
