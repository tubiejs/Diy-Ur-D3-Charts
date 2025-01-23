import React, { FC, useMemo, useState } from "react";
/* @ts-ignore */
import * as d3 from "d3"; // eslint-disable-line import/no-extraneous-dependencies
import { ToolTips } from "./ToolTips";

const defaultStyle = {
    position: "absolute",
    top: 0,
    left: 0,
};

export const Pie: FC<any> = (props: any) => {
    const {
        width = 400,
        height = 400,
        style = {},
        x: tx = 0,
        y: ty = 0,
        outerRadius = 140,
        data = [
            { label: "<5", value: 2704659 },
            { label: "5-13", value: 4499890 },
            { label: "14-17", value: 2159981 },
            { label: "18-24", value: 3853788 },
            { label: "25-44", value: 14106543 },
            { label: "45-64", value: 8819342 },
            { label: "≥65", value: 612463 },
        ],
        colors = [
            "#98abc5",
            "#8a89a6",
            "#7b6888",
            "#6b486b",
            "#a05d56",
            "#d0743c",
            "#ff8c00",
        ],
        title = "Pie",
    } = props;

    const [toolTipsProps, setToolTipsProps] = useState({
        visible: false,
        el: null,
    });

    const [hoverItem, setHoverItem] = useState({
        label: "",
        value: 0,
        percent: "",
    });

    const pie = useMemo(
        () =>
            d3
                .pie() // 定义饼图
                .sort(null)
                .value((d: any) => d.value),
        []
    );

    const arc = useMemo(
        () =>
            d3
                .arc() // 定义单个圆弧
                .innerRadius(0)
                .outerRadius(outerRadius)
                .padAngle(0),
        [outerRadius]
    );

    const labelArc = useMemo(
        () =>
            d3
                .arc() // 定义单个圆弧
                .innerRadius(outerRadius / 2)
                .outerRadius(outerRadius)
                .padAngle(0),
        [outerRadius]
    );

    const percentArc = useMemo(
        () =>
            d3
                .arc() // 定义单个圆弧
                .innerRadius(outerRadius)
                .outerRadius(outerRadius + 50)
                .padAngle(0),
        [outerRadius]
    );

    const sumVal = useMemo(() => d3.sum(data, (d: any) => d.value), [data]);

    const xColor = useMemo(
        () =>
            d3
                .scaleOrdinal()
                .range(colors)
                .domain(data.map((d: any) => d.label).keys()),
        [colors, data]
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
                {pie(data).map((d: any, i: number) => {
                    const { label } = d.data;
                    const { value } = d.data;
                    const percent = `${((100 * value) / sumVal).toFixed(2)}%`;
                    const color = xColor(label);

                    return (
                        <g
                            // eslint-disable-next-line react/no-array-index-key
                            key={i}
                            onPointerEnter={(e: any) => {
                                e.stopPropagation();
                                e.preventDefault();

                                setHoverItem({
                                    label,
                                    value,
                                    percent,
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
                            style={{ cursor: "pointer" }}
                        >
                            <path d={arc(d)} fill={color} />
                            <text
                                dy="0.35em"
                                textAnchor="middle"
                                transform={`translate(${labelArc.centroid(d)})`}
                                fontSize={14}
                                fill="currentColor"
                            >
                                {label}
                            </text>
                            <text
                                dy="0.35em"
                                textAnchor="middle"
                                transform={`translate(${percentArc.centroid(d)})`}
                                fontSize={14}
                                fill={color}
                            >
                                {percent}
                            </text>
                        </g>
                    );
                })}
            </g>
            <text
                fill="currentColor"
                textAnchor="middle"
                transform={`translate(${width / 2}, 20)`}
            >
                {title}
            </text>
            <ToolTips {...toolTipsProps} width={180}>
                <div style={{ padding: 10 }}>
                    <div>label: {hoverItem.label}</div>
                    <div>value: {hoverItem.value}</div>
                    <div>percent: {hoverItem.percent}</div>
                </div>
            </ToolTips>
        </svg>
    );
};
