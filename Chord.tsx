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

export const Chord: FC<any> = (props: any) => {
    const {
        width = 700,
        height = 700,
        marginTop = 40,
        style = {},
        x: tx = 0,
        y: ty = 0,
        innerRadius = 200,
        outerRadius = 250,
        data = [
            [11975, 5871, 8916, 2868],
            [1951, 10048, 2060, 6171],
            [8010, 16145, 8090, 8045],
            [1013, 990, 940, 6907],
        ],
        labels = ["Beijing", "Shanghai", "Guangzhou", "Shenzhen"],
        colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b"],
        title = "Chord Chart",
    } = props;

    const [toolTipsProps, setToolTipsProps] = useState({
        visible: false,
        el: null,
    });

    const [hoverItem, setHoverItem] = useState<any>({
        source: {},
        target: {},
    });

    const chord = useMemo(
        () =>
            d3
                .chord() // 弦
                .padAngle(0.1)
                .sortSubgroups(d3.descending)(data),
        [data]
    );

    const axisArc = useMemo(
        () =>
            d3
                .arc() // 用于画弧
                .innerRadius(innerRadius)
                .outerRadius(outerRadius),
        [innerRadius, outerRadius]
    );

    const chordRibbon = useMemo(
        () =>
            d3
                .ribbon() // 用于画弦
                .radius(innerRadius),
        [innerRadius]
    );

    const groupTicks = useCallback((d: any, step: any) => {
        const k = (d.endAngle - d.startAngle) / d.value;

        return d3
            .range(0, d.value, step)
            .map((value: any) => ({ value, angle: value * k + d.startAngle }));
    }, []);

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
                {chord.map((c: any, i: any) => (
                    <path
                        // eslint-disable-next-line react/no-array-index-key
                        key={`chordRibbon${i}`}
                        fill={colors[c.target.index]}
                        stroke={d3.rgb(colors[c.target.index]).darker()}
                        d={chordRibbon(c)}
                        style={{ cursor: "pointer" }}
                        onPointerEnter={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();

                            setHoverItem(c);

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
                ))}
                {chord.groups.map((group: any, i: any) => (
                    <g
                        // eslint-disable-next-line react/no-array-index-key
                        key={`group${i}`}
                    >
                        <path
                            fill={colors[group.index]}
                            stroke={d3.rgb(colors[group.index]).darker()}
                            d={axisArc(group)}
                        />
                        <text
                            x={axisArc.centroid(group)[0]}
                            y={axisArc.centroid(group)[1]}
                            textAnchor="middle"
                        >
                            {labels[group.index]}
                        </text>
                        {groupTicks(group, 1e3).map((d: any, j: any) => (
                            <g
                                // eslint-disable-next-line react/no-array-index-key
                                key={`groupTicks${i}-${j}`}
                                transform={`rotate(${(d.angle * 180) / Math.PI - 90
                                    }) translate(${outerRadius}, 0)`}
                            >
                                <line x2={6} />
                                {d.value % 5e3 === 0 && (
                                    <text
                                        fill="currentColor"
                                        x={8}
                                        dy=".35em"
                                        textAnchor={d.angle > Math.PI ? "end" : "start"}
                                        transform={
                                            d.angle > Math.PI ? "rotate(180) translate(-16)" : ""
                                        }
                                    >
                                        {d.value}
                                    </text>
                                )}
                            </g>
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
            <ToolTips {...toolTipsProps} width={300}>
                <div style={{ padding: 10, color: "#fff" }}>
                    <div style={{ marginTop: 5 }}>
                        {hoverItem?.source?.index !== hoverItem?.target?.index ? (
                            <>
                                <div>{`From ${labels[hoverItem.source.index]} To ${labels[hoverItem.target.index]
                                    }：${hoverItem.source.value}`}</div>
                                <div>{`From ${labels[hoverItem.target.index]} To ${labels[hoverItem.source.index]
                                    }：${hoverItem.target.value}`}</div>
                            </>
                        ) : (
                            <div>{`From ${labels[hoverItem.source.index]} To ${labels[hoverItem.target.index]
                                }：${hoverItem.source.value}`}</div>
                        )}
                    </div>
                </div>
            </ToolTips>
        </svg>
    );
};
