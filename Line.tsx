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

export const Line: FC<any> = (props: any) => {
    const {
        width = 600,
        height = 400,
        marginTop = 40,
        marginRight = 20,
        marginBottom = 40,
        marginLeft = 40,
        style = {},
        x: tx = 0,
        y: ty = 0,
        data = {
            minY: 0,
            maxY: 5000,
            options: [
                { label: "2017-01", value: 1540 },
                { label: "2017-02", value: 905 },
                { label: "2017-03", value: 632 },
                { label: "2017-04", value: 745 },
                { label: "2017-05", value: 3543 },
                { label: "2017-06", value: 4443 },
                { label: "2017-07", value: 2546 },
                { label: "2017-08", value: 545 },
                { label: "2017-09", value: 154 },
                { label: "2017-10", value: 4848 },
                { label: "2017-11", value: 155 },
                { label: "2017-12", value: 4585 },
            ],
        },
        title = "Line Chart",
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

    /** *  mainChart部分  ** */
    const mainAreaPath = useMemo(
        () =>
            d3
                .line() // 设置 mainChart 路径
                .curve(d3.curveMonotoneX)
                .x((d: any) => x(d.label))
                .y((d: any) => y(d.value)),
        [x, y]
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
            <g ref={gx} transform={`translate(0,${y(0)})`} />
            <g ref={gy} transform={`translate(${marginLeft},0)`} />
            <g>
                <path
                    d={mainAreaPath(data.options)}
                    fill="none"
                    stroke={blueColor}
                    strokeWidth={2}
                />
            </g>
            <g>
                {/* points */}
                {data.options.map((d: any, i: any) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <React.Fragment key={i}>
                        <circle cx={x(d.label)} cy={y(d.value)} r={4} fill={orangeColor} />
                        <text
                            x={x(d.label)}
                            y={y(d.value)}
                            dx={0}
                            dy={d.value > 0 ? -5 : 15}
                            textAnchor="middle"
                            fontSize={14}
                            fill={orangeColor}
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
