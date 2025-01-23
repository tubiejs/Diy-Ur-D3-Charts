import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { createPortal } from "react-dom";

export interface ITipsProps {
    children: React.ReactNode | string;
    content: React.ReactNode | string;
    className?: string;
    width?: number;
    [key: string]: any;
}

export const Tips: React.FC<ITipsProps> = (props: ITipsProps) => {
    const { children, content, width = 100, ...rest } = props;

    const [visible, setVisible] = useState(false);
    const childRef = useRef<HTMLElement | undefined>();
    const popoverRef = useRef<HTMLElement | undefined>();

    const renderChildren = () =>
        React.cloneElement(children as React.ReactElement, {
            ref: childRef,
        });

    useLayoutEffect(() => {
        if (visible && childRef.current && popoverRef.current) {
            const childRect = childRef.current?.getBoundingClientRect();
            const popoverRect = popoverRef.current?.getBoundingClientRect();

            if (popoverRect && childRect) {
                popoverRef.current.style.left = `${childRect.left + (childRect.width - popoverRect.width) / 2
                    }px`;
                popoverRef.current.style.top = `${childRect.top - popoverRect.height - 5
                    }px`;
            }
        }
    }, [visible]);

    useEffect(() => {
        if (!childRef.current) {
            // eslint-disable-next-line no-empty-function
            return () => { };
        }

        const childEl = childRef.current;
        // const popoverEl = popoverRef.current;

        const onPointerOver = (e: any) => {
            e.stopPropagation();
            e.preventDefault();

            setVisible(true);
        };

        const onPointerOut = (e: any) => {
            e.stopPropagation();
            e.preventDefault();

            setVisible(false);
        };

        childEl.addEventListener("pointerover", onPointerOver);
        childEl.addEventListener("pointerout", onPointerOut);
        childEl.addEventListener("pointerleave", onPointerOut);

        return () => {
            childEl.removeEventListener("pointerover", onPointerOver);
            childEl.removeEventListener("pointerout", onPointerOut);
            childEl.removeEventListener("pointerleave", onPointerOut);
        };
    }, []);

    return (
        <>
            {renderChildren()}
            {createPortal(
                <div
                    className={["simple-tips", rest.className || ""]
                        .filter(Boolean)
                        .join(" ")}
                    style={{
                        width,
                        minHeight: 20,
                        display: visible ? "block" : "none",
                    }}
                    ref={(r: any) => {
                        popoverRef.current = r;
                    }}
                >
                    {content}
                </div>,
                document.body
            )}
        </>
    );
};

export interface IToolTipsProps {
    children: React.ReactNode | string;
    el: any;
    visible: boolean;
    className?: string;
    width?: number;
    [key: string]: any;
}

export const ToolTips: React.FC<IToolTipsProps> = (props: IToolTipsProps) => {
    const { children, visible, el, width = 100, ...rest } = props;

    const popoverRef = useRef<HTMLElement | undefined>();
    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);

    useEffect(() => {
        if (visible && el && popoverRef.current) {
            const hoverRect = el?.getBoundingClientRect();
            const popoverRect = popoverRef.current?.getBoundingClientRect();

            if (popoverRect && hoverRect) {
                setLeft(hoverRect.left + (hoverRect.width - popoverRect.width) / 2);
                setTop(hoverRect.top - popoverRect.height - 5);
            }
        }
    }, [visible, el, popoverRef]);

    return createPortal(
        <div
            className={["simple-tips", rest.className || ""]
                .filter(Boolean)
                .join(" ")}
            style={{
                width,
                minHeight: 20,
                display: visible ? "block" : "none",
                left,
                top,
            }}
            ref={(r: any) => {
                popoverRef.current = r;
            }}
        >
            {children}
        </div>,
        document.body
    );
};

const style = document.createElement("style");
style.innerHTML = `
    .simple-tips {
      position: fixed;
      z-index: 999;
      pointer-events: none;
      box-sizing: border-box;
      color: #fff;
      background-color: rgba(121, 85, 72, .8);
      border-radius: 4px;
    }

    .simple-tips:after {
      box-sizing: border-box;
      display: inline;
      font-size: 10px;
      width: 100%;
      line-height: 1;
      color: rgba(121, 85, 72, .8);
      content: "▼";
      position: absolute;
      text-align: center;
      margin: -3px 0 0;
      top: 100%;
      left: 0;
    }
`;
document.head.appendChild(style);
