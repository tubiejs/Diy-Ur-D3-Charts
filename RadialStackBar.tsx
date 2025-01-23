import React, { FC, useMemo, useState, useCallback } from "react";
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

export const RadialStackBar: FC<any> = (props: any) => {
    const {
        width = 700,
        height = 700,
        marginTop = 40,
        style = {},
        x: tx = 0,
        y: ty = 0,
        innerRadius = 140,
        outerRadius = 280,
        data = {
            minY: 0,
            maxY: 3000,
            values: [
                [1155, 200, 114, 234],
                [50, 210, 314, 234],
                [175, 230, 414, 334],
                [885, 260, 514, 353],
                [195, 290, 714, 512],
                [155, 500, 814, 754],
            ],
        },
        labels = ["2019", "2020", "2021", "2022", "2023", "2024"],
        subLabels = ["Season 1", "Season 2", "Season 3", "Season 4"],
        colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b"],
        title = "RadialStackBar Chart",
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

    const x = useMemo(
        () =>
            d3
                .scaleBand(labels, [0, 2 * Math.PI]) // 定义x轴
                .align(0),
        [labels]
    );

    const xBandWidth = useMemo(() => x.bandwidth(), [x]);

    const y = useMemo(
        () => d3.scaleLinear([data.minY, data.maxY], [innerRadius, outerRadius]),
        [data.minY, data.maxY, innerRadius, outerRadius]
    );

    const yTicks = useMemo(() => y.ticks(6).slice(1), [y]);

    const keys = useMemo(() => subLabels.map((s: any, i: any) => i), [subLabels]);

    const series = useMemo(
        () => d3.stack().keys(keys).offset(d3.stackOffsetDiverging)(_data),
        [_data, keys]
    );

    const getD = useCallback(
        (col: any, row: any) =>
            d3
                .arc()
                .innerRadius(isLegendHover ? y(0) : y(col[0]))
                .outerRadius(isLegendHover ? y(col.data[row.key]) : y(col[1]))
                .startAngle(x(col.data.label))
                .endAngle(x(col.data.label) + xBandWidth)
                .padAngle(0.01)
                .padRadius(innerRadius)(),
        [y, x, xBandWidth, innerRadius, isLegendHover]
    );

    return (
        <svg
            width={width}
            height={height}
            style={{ ...defaultStyle, ...style }}
            transform={`translate(${tx},${ty})`}
            ref={props.compRef}
            className={props.className}
        >
            <g transform={`translate(${width / 2}, ${height / 2})`}>
                <g>
                    {yTicks.map((d: any, i: any) => (
                        <g
                            // eslint-disable-next-line react/no-array-index-key
                            key={`yAxisCircle${i}`}
                        >
                            <circle
                                r={y(d)}
                                fill="none"
                                stroke="#000"
                                strokeWidth={1}
                                strokeOpacity={0.5}
                            />
                        </g>
                    ))}
                </g>
                {/* xAxis */}
                {series[0]?.map?.((d: any, i: any) => (
                    <g
                        // eslint-disable-next-line react/no-array-index-key
                        key={`xAxis${i}`}
                        transform={`rotate(${((x(d.data.label) + xBandWidth / 2) * 180) / Math.PI - 90
                            }) translate(${innerRadius}, 0)`}
                    >
                        <line x2={-10} stroke="currentColor" strokeWidth={1} />
                        <text
                            x={x(d.data.label) + xBandWidth / 2 - 20}
                            y={5}
                            fill="currentColor"
                            fontSize={12}
                            textAnchor="end"
                        >
                            {d.data.label}
                        </text>
                    </g>
                ))}
                {/* bars */}
                {series.map((row: any, i: any) =>
                    row.map((col: any, j: any) => (
                        <path
                            // eslint-disable-next-line react/no-array-index-key
                            key={`bar${i}-${j}`}
                            d={getD(col, row)}
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
                <g>
                    {yTicks.map((d: any, i: any) => (
                        <g
                            // eslint-disable-next-line react/no-array-index-key
                            key={`yAxisText${i}`}
                        >
                            <text
                                x={-6}
                                y={-y(d)}
                                fill="currentColor"
                                fontSize={12}
                                textAnchor="center"
                                style={{
                                    textShadow: "0 1px 0 #fff",
                                    fontWeight: 700,
                                }}
                            >
                                {d}
                            </text>
                        </g>
                    ))}
                </g>
                {/* legend */}
                {keys.map((d: any, i: any) => (
                    <g
                        // eslint-disable-next-line react/no-array-index-key
                        key={`legend${i}`}
                        transform={`translate(-40, ${i * 20 - keys.length * 10})`}
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
                        <rect
                            width={18}
                            height={18}
                            fill={colors[i]}
                            stroke={barsVisible[i] ? "currentColor" : "transparent"}
                        />
                        <text
                            x={24}
                            y={12}
                            fill={colors[i]}
                            fontSize={12}
                            textAnchor="start"
                        >
                            {subLabels[i]}
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
            <text
                fill="currentColor"
                textAnchor="middle"
                transform={`translate(${width / 2},${marginTop / 2 + 25})`}
            >
                {yLabel}
            </text>
            <text
                fill="currentColor"
                textAnchor="middle"
                transform={`translate(${width / 2},${height / 2 - innerRadius + marginTop
                    })`}
            >
                {xLabel}
            </text>
            <ToolTips {...toolTipsProps} width={200}>
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
                                {`${subLabels[i]}: ${d} (${(
                                    (d /
                                        hoverItem.value.reduce(
                                            (cur: any, val: any) => cur + val,
                                            0
                                        )) *
                                    100
                                ).toFixed(2)}%)`}
                            </div>
                        ))}
                    </div>
                </div>
            </ToolTips>
        </svg>
    );
};
