import React, { FC, useRef, useEffect, useMemo, useState } from "react";
import { ToolTips } from "./ToolTips";
/* @ts-ignore */
import * as d3 from "d3"; // eslint-disable-line import/no-extraneous-dependencies

const defaultStyle = {
    position: "absolute",
    top: 0,
    left: 0,
};

const blueColor = "rgba(84, 112, 198, 0.8)";

export const Scatter: FC<any> = (props: any) => {
    const {
        data = [
            [10.0, 8.04],
            [8.07, 6.95],
            [13.0, 7.58],
            [9.05, 8.81],
            [11.0, 8.33],
            [14.0, 7.66],
            [13.4, 6.81],
            [10.0, 6.33],
            [14.0, 8.96],
            [12.5, 6.82],
            [9.15, 7.2],
            [11.5, 7.2],
            [3.03, 4.23],
            [12.2, 7.83],
            [2.02, 4.47],
            [1.05, 3.33],
            [4.05, 4.96],
            [6.03, 7.24],
            [12.0, 6.26],
            [12.0, 8.84],
            [7.08, 5.82],
            [5.02, 5.68],
        ],
        width = 400,
        height = 400,
        marginTop = 40,
        marginRight = 20,
        marginBottom = 40,
        marginLeft = 40,
        style = {},
        x: tx = 0,
        y: ty = 0,
        title = "Scatter Chart",
        xLabel = "X Axis",
        yLabel = "Y Axis",
    } = props;

    const [toolTipsProps, setToolTipsProps] = useState({
        visible: false,
        el: null,
    });

    const [hoverPoverContent, setHoverPoverContent] = useState("");

    const gx = useRef<any>();
    const gy = useRef<any>();

    const x = useMemo(
        () =>
            d3.scaleLinear(
                [d3.min(data, (d: any) => d[0]), d3.max(data, (d: any) => d[0])],
                [marginLeft, width - marginRight]
            ),
        [data, width, marginLeft, marginRight]
    );

    const y = useMemo(
        () =>
            d3.scaleLinear(
                [d3.min(data, (d: any) => d[1]), d3.max(data, (d: any) => d[1])],
                [height - marginBottom, marginTop]
            ),
        [data, height, marginBottom, marginTop]
    );

    const yTicks = useMemo(() => y.ticks(), [y]);

    const bgBarHeight = useMemo(
        () => Math.abs(y(yTicks[0]) - y(yTicks[1])),
        [y, yTicks]
    );

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
                        fill={i % 2 === 0 ? "transparent" : "#ddd"}
                    />
                ))}
            </g>
            <g ref={gx} transform={`translate(0,${height - marginBottom})`} />
            <g ref={gy} transform={`translate(${marginLeft},0)`} />
            <g fill={blueColor} stroke="none">
                {data.map((d: any, i: any) => (
                    <circle
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        cx={x(d[0])}
                        cy={y(d[1])}
                        r="10"
                        onPointerEnter={(e: any) => {
                            e.stopPropagation();
                            e.preventDefault();

                            setHoverPoverContent(`【x: ${d[0]} y: ${d[1]}】`);

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
                        style={{ cursor: "pointer" }}
                    />
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
                transform={`translate(${width - marginRight},${height - marginBottom})`}
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
            <ToolTips {...toolTipsProps} width={180}>
                <div style={{ padding: "10px 5px" }}>{hoverPoverContent}</div>
            </ToolTips>
        </svg>
    );
};
