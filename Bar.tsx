import React, { FC, useRef, useEffect, useMemo } from "react";
/* @ts-ignore */
import * as d3 from "d3"; // eslint-disable-line import/no-extraneous-dependencies

const defaultStyle = {
    position: "absolute",
    top: 0,
    left: 0,
};

const blueColor = "#5470c6";
const orangeColor = "#fa8c16";

export const Bar: FC<any> = (props: any) => {
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
            minY: -100,
            maxY: 100,
            options: [
                {
                    label: "周一",
                    value: 18.167,
                },
                {
                    label: "周二",
                    value: 43.492,
                },
                {
                    label: "周三",
                    value: 12.782,
                },
                {
                    label: "周四",
                    value: -24.253,
                },
                {
                    label: "周五",
                    value: 82.702,
                },
                {
                    label: "周六",
                    value: -22.288,
                },
                {
                    label: "周日",
                    value: 22.288,
                },
            ],
        },
        title = "Bar Chart",
        xLabel = "X Axis",
        yLabel = "Y Axis",
    } = props;

    const gx = useRef<any>();
    const gy = useRef<any>();

    const x = useMemo(
        () =>
            d3
                .scaleBand(
                    data.options.map((item: any) => item.label),
                    [marginLeft, width - marginRight]
                )
                .paddingInner(0.1),
        [data, width, marginLeft, marginRight]
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
                        fill={i % 2 === 0 ? "transparent" : "#ddd"}
                    />
                ))}
            </g>
            <g ref={gx} transform={`translate(0,${y(0)})`} />
            <g ref={gy} transform={`translate(${marginLeft},0)`} />
            <g fill={blueColor} stroke="none">
                {data.options.map((d: any, i: any) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <React.Fragment key={i}>
                        <rect
                            x={x(d.label)}
                            y={d.value > 0 ? y(d.value) : y(0)}
                            width={barWidth}
                            height={Math.abs(y(d.value) - y(0))}
                            fill={d.value > 0 ? blueColor : orangeColor}
                        />
                        <text
                            x={x(d.label)}
                            y={y(d.value)}
                            dx={barWidth / 2}
                            dy={d.value > 0 ? -5 : 15}
                            textAnchor="middle"
                            fontSize={12}
                        >
                            {d.value}
                        </text>
                    </React.Fragment>
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
        </svg>
    );
};
