import React, { FC, useRef, useEffect, useMemo } from "react";
/* @ts-ignore */
import * as d3 from "d3"; // eslint-disable-line import/no-extraneous-dependencies

const defaultStyle = {
    position: "absolute",
    top: 0,
    left: 0,
};
// y = kx + b
// const FY = (k: number, b: number) => (x: number) => k * x + b;

export const XLinearLine: FC<any> = (props: any) => {
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
            minX: -100,
            maxX: 100,
            minY: -100,
            maxY: 100,
        },
        func = {
            value: "y = k * x + b",
            yKey: "y",
            xKey: "x",
            constants: {
                k: 1,
                b: 0,
            },
        },
        title = "XLinearLine",
        xLabel = "X Axis",
        yLabel = "Y Axis",
    } = props;

    const gx = useRef<any>();
    const gy = useRef<any>();

    const fy = useMemo(() => {
        try {
            let defineVars = "";

            Object.keys(func.constants).forEach((key: string) => {
                defineVars += `const ${key} = ${func.constants[key]};`;
            });

            // eslint-disable-next-line no-new-func
            return new Function(
                func.xKey || "x",
                `${defineVars} return ${func.value.split("=")[1].trim()};`
            );
        } catch (e) {
            return () => 0;
        }
    }, [func.value, func.constants, func.xKey]);

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

    // y = kx + b
    const points = useMemo(
        () =>
            d3.range(data.minX, data.maxX, 0.05).map((_x: number) => [_x, fy(_x)]),
        [data.minX, data.maxX, fy]
    );

    const line = useMemo(
        () =>
            d3
                .line()
                .x((d: any) => x(d[0]))
                .y((d: any) => y(d[1])),
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
            <g
                ref={gx}
                transform={`translate(0,${height / 2 + (marginTop - marginBottom) / 2
                    })`}
            />
            <g ref={gy} transform={`translate(${width / 2},0)`} />
            <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                d={line(points)}
            />
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
