/* eslint-disable no-nested-ternary */
import React, { FC, useRef, useEffect, useMemo, useState } from "react";
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

export const StackBar: FC<any> = (props: any) => {
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
            maxY: 3000,
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
        title = "StackBar Chart",
        xLabel = "X Axis",
        yLabel = "Y Axis",
    } = props;
    const gx = useRef<any>();
    const gy = useRef<any>();

    const [toolTipsProps, setToolTipsProps] = useState({
        visible: false,
        el: null,
    });

    const [hoverItem, setHoverItem] = useState({
        label: "",
        value: [],
    });

    const [barsVisible, setBarsVisible] = useState(subLabels.map(() => true));

    const isLegendHover = useMemo(
        () => barsVisible.some((b: boolean) => !b),
        [barsVisible]
    );

    /*
     *[
     *   { label: '2011', 0: 155, 1: 200, 2: -214, 3: 234 },
     *]
     */
    const _data = useMemo(() => {
        const res: any = [];

        labels.forEach((label: any, i: any) => {
            const obj: any = {
                label,
            };

            subLabels.forEach((s: any, j: any) => {
                obj[j] = data.values[i][j];
            });

            res.push(obj);
        });

        return res;
    }, [data, labels, subLabels]);

    const keys = useMemo(() => subLabels.map((s: any, i: any) => i), [subLabels]);

    const series = d3.stack().keys(keys).offset(d3.stackOffsetDiverging)(_data);

    const x = useMemo(
        () =>
            d3.scaleBand(labels, [marginLeft, width - marginRight]).paddingInner(0.1),
        [labels, width, marginLeft, marginRight]
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

    const barWidth = useMemo(() => x.bandwidth(), [x]);

    useEffect(() => {
        d3.select(gx.current).call(d3.axisBottom(x));
    }, [gx, x]);

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
                {/* stack bar */}
                {series.map((row: any, i: any) =>
                    row.map((col: any, j: any) => (
                        <rect
                            // eslint-disable-next-line react/no-array-index-key
                            key={`bar${i}-${j}`}
                            x={x(col.data.label)}
                            y={
                                isLegendHover
                                    ? col.data[row.key] > 0
                                        ? y(col.data[row.key])
                                        : y(0)
                                    : y(col[1])
                            }
                            width={barWidth}
                            height={y(col[0]) - y(col[1])}
                            fill={barsVisible[row.key] ? colors[row.key] : "transparent"}
                            style={{ cursor: "pointer" }}
                            onPointerEnter={(e: any) => {
                                e.stopPropagation();
                                e.preventDefault();

                                setHoverItem({
                                    label: labels[j],
                                    value: data.values[j],
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
                        />
                    ))
                )}
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
                    <div>{`${hoverItem.label} Total: ${hoverItem.value.reduce(
                        (cur: any, val: any) => cur + val,
                        0
                    )}`}</div>
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
