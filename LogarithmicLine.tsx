import React, { FC, useRef, useEffect, useMemo } from "react";
/* @ts-ignore */
import * as d3 from "d3"; // eslint-disable-line import/no-extraneous-dependencies

const defaultStyle = {
    position: "absolute",
    top: 0,
    left: 0,
};
// Y = logaX（a>0，且a≠1）
const FY = (a: number) => (x: number) => Math.log(x) / Math.log(a);

export const LogarithmicLine: FC<any> = (props: any) => {
    const {
        width = 400,
        height = 400,
        marginTop = 20,
        marginRight = 20,
        marginBottom = 20,
        marginLeft = 20,
        style = {},
        x: tx = 0,
        y: ty = 0,
        data = {
            a: Math.E,
            minX: -100,
            maxX: 100,
            minY: -100,
            maxY: 100,
        },
        title = "LogarithmicLine",
        xLabel = "X Axis",
        yLabel = "Y Axis",
    } = props;

    const gx = useRef<any>();
    const gy = useRef<any>();

    const fy = useMemo(
        () => FY(data.a > 0 && data.a !== 1 ? data.a : Math.E),
        [data.a]
    );

    const x = useMemo(
        () =>
            d3.scaleLinear([data.minX, data.maxX], [marginLeft, width - marginRight]),
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

    // Y = logaX（a>0，且a≠1）
    const points = useMemo(
        () => d3.range(0.05, data.maxX, 0.05).map((_x: number) => [_x, fy(_x)]),
        [data.maxX, fy]
    );

    const line = useMemo(
        () =>
            d3
                .line()
                .x((d: any) => x(d[0]))
                .y((d: any) => y(d[1])),
        [x, y]
    );

    const pathD = useMemo(() => line(points), [points, line]);

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
            <g
                ref={gx}
                transform={`translate(0,${height / 2 + (marginTop - marginBottom) / 2
                    })`}
            />
            <g ref={gy} transform={`translate(${width / 2},0)`} />
            <path fill="none" stroke="currentColor" strokeWidth="1.5" d={pathD} />
            {/* <g fill="white" stroke="currentColor" strokeWidth="1.5">
        {points.map((d: any, i: any) => (
          // eslint-disable-next-line react/no-array-index-key
          <circle key={i} cx={x(d[0])} cy={y(d[1])} r="2.5" />
        ))}
      </g> */}
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
                transform={`translate(${width - marginRight},${height / 2})`}
            >
                {xLabel}
            </text>
            <text
                fill="currentColor"
                textAnchor="start"
                transform={`translate(${width / 2 + marginLeft},${marginTop + marginBottom
                    })`}
            >
                {yLabel}
            </text>
        </svg>
    );
};
