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

export const Radar: FC<any> = (props: any) => {
    const {
        width = 700,
        height = 700,
        marginTop = 40,
        style = {},
        x: tx = 0,
        y: ty = 0,
        radius = 250,
        data = {
            minY: 0,
            maxY: 100,
            values: [
                [88, 92, 90, 88, 95],
                [67, 78, 80, 72, 74],
                [77, 83, 68, 69, 65],
                [72, 67, 62, 67, 68],
            ],
        },
        labels = ["Class 1", "Class 2", "Class 3", "Class 4"],
        subLabels = ["Chinese", "Math", "Physics", "Chemistry", "English"],
        colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"],
        title = "Radar Chart",
    } = props;

    const [toolTipsProps, setToolTipsProps] = useState({
        visible: false,
        el: null,
    });

    const [hoverItem, setHoverItem] = useState<any>([]);

    const series = useMemo(
        () =>
            data.values.map((cls: number[], i: number) =>
                cls.map((v: number, j: number) => ({
                    label: labels[i],
                    subLabel: subLabels[j],
                    value: v,
                    key: subLabels[j],
                }))
            ),
        [data.values, labels, subLabels]
    );

    const x = useMemo(
        () =>
            d3
                .scaleBand(subLabels, [0, 2 * Math.PI]) // 定义x轴
                .align(0),
        [subLabels]
    );

    const y = useMemo(
        () =>
            d3
                .scaleLinear([data.minY, data.maxY], [0, radius]) // 定义y轴
                .nice(),
        [data.minY, data.maxY, radius]
    );

    const yTicks = useMemo(() => y.ticks(10), [y]);

    const subLabelAngleData = useMemo(
        () =>
            subLabels.map((v: string) => [
                {
                    angle: 0,
                    radius: 0,
                },
                {
                    angle: x(v),
                    radius: y(data.maxY + 10),
                },
            ]),
        [subLabels, x, data.maxY, y]
    );

    const lineRadial = useMemo(
        () =>
            d3
                .lineRadial()
                .curve(d3.curveLinearClosed)
                .radius((d: any) => d.radius)
                .angle((d: any) => d.angle),
        []
    );

    const radarLineRadial = useMemo(
        () =>
            d3
                .lineRadial()
                .curve(d3.curveLinearClosed)
                .radius((d: any) => y(d.value))
                .angle((d: any) => x(d.key)),
        [x, y]
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
                {/* yTicks */}
                {yTicks.map((t: number, i: number) => (
                    <React.Fragment
                        // eslint-disable-next-line react/no-array-index-key
                        key={`circle${i}`}
                    >
                        <circle fill="#ddd" stroke="#999" fillOpacity={0.3} r={y(t)} />
                    </React.Fragment>
                ))}
                {subLabelAngleData.map((t: string, i: number) => (
                    <React.Fragment
                        // eslint-disable-next-line react/no-array-index-key
                        key={`subLabelLine${i}`}
                    >
                        <path fill="none" stroke="#fff" strokeWidth={2} d={lineRadial(t)} />
                    </React.Fragment>
                ))}
                {subLabels.map((t: string, i: number) => (
                    <React.Fragment
                        // eslint-disable-next-line react/no-array-index-key
                        key={`subLabelText${i}`}
                    >
                        <text
                            fill="currentColor"
                            x={Math.sin(x(t)) * (radius + 30)}
                            y={-1 * Math.cos(x(t)) * (radius + 30)}
                            dy="0.35em"
                            textAnchor={x(t) > Math.PI ? "end" : "start"}
                            style={{
                                textShadow: "1px 1px 0 #fff",
                            }}
                        >
                            {t}
                        </text>
                    </React.Fragment>
                ))}
                {yTicks.map((t: number, i: number) => (
                    <React.Fragment
                        // eslint-disable-next-line react/no-array-index-key
                        key={`yTickText${i}`}
                    >
                        <text
                            fill="currentColor"
                            // x={6}
                            y={-y(t)}
                            dy="0.35em"
                            textAnchor="middle"
                            style={{
                                textShadow: "1px 1px 0 #fff",
                            }}
                        >
                            {t}
                        </text>
                    </React.Fragment>
                ))}
                {series.map((row: any, i: any) => (
                    <React.Fragment
                        // eslint-disable-next-line react/no-array-index-key
                        key={`radarLine${i}`}
                    >
                        <path
                            fill={colors[i]}
                            fillOpacity={row[0].label === hoverItem?.[0]?.label ? 0.5 : 0.2}
                            stroke={colors[i]}
                            strokeWidth={1}
                            d={radarLineRadial(row)}
                            style={{
                                cursor: "pointer",
                                strokeWidth: row[0].label === hoverItem?.[0]?.label ? 3 : 1,
                            }}
                            onPointerEnter={(e: any) => {
                                e.stopPropagation();
                                e.preventDefault();

                                setHoverItem(row);

                                setToolTipsProps({
                                    visible: true,
                                    el: e.target,
                                });
                            }}
                            onPointerLeave={(e: any) => {
                                e.stopPropagation();
                                e.preventDefault();

                                setHoverItem([]);

                                setToolTipsProps({
                                    visible: false,
                                    el: null,
                                });
                            }}
                        />
                    </React.Fragment>
                ))}
            </g>
            <g transform={`translate(20,${height - 45})`}>
                {/* legends */}
                {labels.map((d: any, i: any) => (
                    <g
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        transform={`translate(${i * 60},0)`}
                        style={{ cursor: "pointer" }}
                        onPointerEnter={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();

                            setHoverItem(series[i]);

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
                        <rect width={60} height={10} fill={colors[i]} />
                        <text x={5} y={20} fill={colors[i]} fontSize={12}>
                            {d}
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
            <ToolTips {...toolTipsProps} width={200}>
                <div style={{ padding: 10, color: "#fff" }}>
                    <div>{hoverItem[0]?.label}</div>
                    <div style={{ marginTop: 5 }}>
                        {hoverItem.map((d: any, i: any) => {
                            const index = labels.findIndex((v: any) => v === d.label);

                            return (
                                <div
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={i}
                                    style={{
                                        color: "#fff",
                                        fontSize: 14,
                                        backgroundColor: d3
                                            .rgb(colors[index])
                                            .darker(0.8)
                                            .toString(),
                                        marginTop: 2,
                                        borderRadius: 4,
                                        padding: "0 5px",
                                    }}
                                >
                                    {`${d.subLabel}: ${d.value}`}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ToolTips>
        </svg>
    );
};
