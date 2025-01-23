import React, { FC, useMemo } from "react";
/* @ts-ignore */
import * as d3 from "d3"; // eslint-disable-line import/no-extraneous-dependencies

const defaultStyle = {
    position: "absolute",
    top: 0,
    left: 0,
};

// r = a + bθ（其中 a 和 b 均为实数。当θ = 0时，a为起点到极坐标原点的距离。 dr/dθ = b ，b为螺旋线旋转的角速度）
const FY = (a: number, b: number) => (x: number) => a + b * x;

const nameMap = {
    degree_0: "0°",
    degree_45: "45°",
    degree_90: "90°",
    degree_135: "135°",
    degree_180: "180°",
    degree_225: "225°",
    degree_270: "270°",
    degree_315: "315°",
};

const nameKeys = Object.keys(nameMap);

export const ArchimedeanSpiralLine: FC<any> = (props: any) => {
    const {
        width = 400,
        height = 400,
        style = {},
        x: tx = 0,
        y: ty = 0,
        outerRadius = 140,
        data = {
            a: 0,
            b: 1, // 角速度
            minX: 0,
            maxX: 4800, // θ 角度 如： 0-360度
            minY: 0,
            maxY: 10, // r值
        },
        title = "ArchimedeanSpiralLine",
    } = props;

    const fy = useMemo(() => FY(data.a, data.b), [data.a, data.b]);

    const x = useMemo(
        // scaleBand(domain, range).align(align)
        () => d3.scaleBand(nameKeys, [0, 2 * Math.PI]).align(0),
        []
    );

    const y = useMemo(
        // scaleLinear(domain, range)
        () => d3.scaleLinear([data.minY, data.maxY], [0, outerRadius]),
        [data.minY, data.maxY, outerRadius]
    );

    // r = a + bθ
    const spiralLinePoints = useMemo(
        () =>
            d3.range(data.minX, data.maxX, 5).map((_x: number) => {
                const angle = (_x * Math.PI) / 180;

                return [angle, fy(angle)];
            }),
        [data.minX, data.maxX, fy]
    );

    const spiralLine = useMemo(
        () =>
            d3
                .lineRadial()
                .angle((d: any) => d[0])
                .radius((d: any) => y(d[1]))
                .curve(d3.curveLinear),
        [y]
    );

    const spiralLinePathD = useMemo(
        () => spiralLine(spiralLinePoints),
        [spiralLinePoints, spiralLine]
    );

    // xTicks
    const xTickData = useMemo(
        () =>
            nameKeys.map((key: any) => [
                { angle: 0, radius: 0, key },
                { angle: x(key), radius: outerRadius, key },
            ]),
        [x, outerRadius]
    );

    const xTickLine = useMemo(
        () =>
            d3
                .lineRadial()
                .angle((d: any) => d.angle)
                .radius((d: any) => d.radius)
                .curve(d3.curveLinearClosed),
        []
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
            <g transform={`translate(${width / 2},${height / 2})`}>
                {xTickData.map((d: any) => (
                    <React.Fragment key={d[0].key}>
                        <path d={xTickLine(d)} fill="none" stroke="#999" strokeWidth="1" />
                        <text
                            textAnchor="middle"
                            transform={`translate(${Math.sin(x(d[0].key)) * (outerRadius + 20)
                                },${-1 * Math.cos(x(d[0].key)) * (outerRadius + 20)})`}
                        >
                            {/* @ts-ignore */}
                            {nameMap[d[0].key]}
                        </text>
                    </React.Fragment>
                ))}
            </g>
            <path
                fill="none"
                stroke="blue"
                transform={`translate(${width / 2}, ${height / 2})`}
                strokeWidth="1.5"
                d={spiralLinePathD}
            />
            <g transform={`translate(${width / 2},${height / 2})`}>
                {y
                    .ticks(10)
                    .reverse()
                    .map((d: any) => (
                        <React.Fragment key={d}>
                            <circle r={y(d)} fill="none" stroke="#999" fillOpacity={0.05} />
                            <text
                                textAnchor="middle"
                                transform={`translate(6,${-y(d)})`}
                                fill="none"
                                stroke="#fff"
                                strokeWidth="5"
                            >
                                {y.tickFormat(10, "r")(d)}
                            </text>
                            <text textAnchor="middle" transform={`translate(6,${-y(d)})`}>
                                {y.tickFormat(10, "r")(d)}
                            </text>
                        </React.Fragment>
                    ))}
            </g>
            <text
                fill="currentColor"
                textAnchor="middle"
                transform={`translate(${width / 2}, 20)`}
            >
                {title}
            </text>
        </svg>
    );
};
