import React, { useId, useState } from "react";
import { ShoppingCart, Check } from "lucide-react";

export interface AddToCartAnimationProps {
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  pillColor?: string;
  textColor?: string;
  text?: string;
  isAdding?: boolean;
  isAdded?: boolean;
  /**
   * 'onAction': plays animation when adding / clicked (recommended for cards)
   * 'continuous': continuous 2.4s loop from the user SVG
   * 'hover': plays on hover and when clicked
   */
  mode?: "onAction" | "continuous" | "hover";
}

export function AddToCartAnimation({
  onClick,
  disabled = false,
  className = "",
  pillColor = "#0f1018",
  textColor = "#ffffff",
  text = "ADD TO CART",
  isAdding = false,
  isAdded = false,
  mode = "onAction",
}: AddToCartAnimationProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const [isHovered, setIsHovered] = useState(false);

  const shouldAnimate =
    mode === "continuous" ||
    (mode === "hover" && (isHovered || isAdding)) ||
    (mode === "onAction" && isAdding);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isAdding}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Add to cart"
      className={`group relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 ${className}`}
    >
      {isAdded ? (
        <div
          className="w-full h-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all"
          style={{ backgroundColor: "#12A488", color: "#04110E" }}
        >
          <Check className="h-3.5 w-3.5 stroke-[3]" />
          <span>ADDED</span>
        </div>
      ) : shouldAnimate ? (
        <svg
          fill="none"
          height="100%"
          width="100%"
          viewBox="0 135 1000 230"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm group-hover:drop-shadow-md transition-all"
        >
          <defs>
            <clipPath id={`${uid}-i0`}>
              <rect height="500" width="1000" y="0" x="0" />
            </clipPath>

            <filter id={`${uid}-i16`}>
              <feColorMatrix
                values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
                type="matrix"
              />
            </filter>

            <mask
              height="20000"
              width="20000"
              y="-10000"
              x="-10000"
              maskContentUnits="userSpaceOnUse"
              maskUnits="userSpaceOnUse"
              style={{ maskType: "alpha" }}
              id={`${uid}-i17`}
            >
              <g filter={`url(#${uid}-i16)`}>
                <g transform="translate(501,249.5)">
                  <g transform="scale(1,1)">
                    <animateTransform
                      repeatCount="indefinite"
                      type="scale"
                      attributeName="transform"
                      dur="2.4s"
                      begin="0s"
                      calcMode="spline"
                      values="1 1; 0.95 0.95; 1 1; 1 1"
                      keyTimes="0; 0.066667; 0.133333; 1"
                      keySplines="0.333 0 0.667 1; 0.333 0 0.667 1; 0 0 1 1"
                      fill="freeze"
                    />
                    <g transform="translate(-1,-12.5)">
                      <g
                        transform="matrix(1.008,0,0,1.008,-0.008,-0.098)"
                        id={`${uid}-i18`}
                      >
                        <g
                          id={`${uid}-i19`}
                          transform="matrix(1,0,0,1,1,12.5)"
                        >
                          <rect
                            ry="209"
                            rx="209"
                            height="201"
                            width="898"
                            y="-100.5"
                            x="-449"
                            fill={pillColor}
                          />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </mask>
          </defs>

          {/* Transparent canvas */}
          <rect y="0" x="0" fill="transparent" height="500" width="1000" />

          {/* Background Button Pill */}
          <g transform="matrix(0.556,0,0,0.556,222,111)" id={`${uid}-i26`}>
            <g clipPath={`url(#${uid}-i0)`}>
              <g>
                <g transform="translate(501,249.5)">
                  <g transform="scale(1,1)">
                    <animateTransform
                      repeatCount="indefinite"
                      type="scale"
                      attributeName="transform"
                      dur="2.4s"
                      begin="0s"
                      calcMode="spline"
                      values="1 1; 0.95 0.95; 1 1; 1 1"
                      keyTimes="0; 0.066667; 0.133333; 1"
                      keySplines="0.333 0 0.667 1; 0.333 0 0.667 1; 0 0 1 1"
                      fill="freeze"
                    />
                    <g transform="translate(-1,-12.5)">
                      <g transform="matrix(1,0,0,1,1,12.5)">
                        <rect
                          ry="209"
                          rx="209"
                          height="201"
                          width="898"
                          y="-100.5"
                          x="-449"
                          fill={pillColor}
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>

          {/* Masked Active Animations (cart, drop item, text) */}
          <g mask={`url(#${uid}-i17)`}>
            <g transform="translate(501,249.5)">
              <g transform="scale(1,1)">
                <animateTransform
                  repeatCount="indefinite"
                  type="scale"
                  attributeName="transform"
                  dur="2.4s"
                  begin="0s"
                  calcMode="spline"
                  values="1 1; 0.95 0.95; 1 1; 1 1"
                  keyTimes="0; 0.066667; 0.133333; 1"
                  keySplines="0.333 0 0.667 1; 0.333 0 0.667 1; 0 0 1 1"
                  fill="freeze"
                />
                <g transform="translate(-1,-12.5)">
                  <g transform="matrix(1.008,0,0,1.008,-503.943,-238.963)">
                    <g clipPath={`url(#${uid}-i0)`}>
                      {/* ADD TO CART Text */}
                      <g>
                        <animate
                          repeatCount="indefinite"
                          attributeName="opacity"
                          dur="2.4s"
                          begin="0s"
                          fill="freeze"
                          values="1; 1; 0; 0; 1; 1"
                          keyTimes="0; 0.166667; 0.333334; 0.816666; 0.983333; 1"
                          keySplines="0 0 1 1; 0.333 0 0.667 1; 0.333 0 0.833 1; 0.167 0 0.833 1; 0 0 1 1"
                          calcMode="spline"
                        />
                        <g transform="translate(571,249.5) scale(1,1) translate(1,18.765)">
                          <text
                            fill={textColor}
                            dominantBaseline="middle"
                            textAnchor="middle"
                            fontWeight="700"
                            fontSize="64"
                            letterSpacing="2"
                            fontFamily="Outfit, Inter, system-ui, sans-serif"
                          >
                            {text}
                          </text>
                        </g>
                      </g>

                      {/* Cart with Drop Item */}
                      <g transform="translate(133.214,294.711)">
                        <animateTransform
                          repeatCount="indefinite"
                          type="translate"
                          attributeName="transform"
                          dur="2.4s"
                          begin="0s"
                          calcMode="spline"
                          values="133.214 294.711; 133.214 294.711; 136.977 294.711; 148.278 294.711; 165.667 294.711; 188.106 294.711; 214.3 294.711; 243.36 294.711; 274.089 294.711; 305.339 294.711; 336.068 294.711; 365.128 294.711; 391.322 294.711; 413.761 294.711; 431.15 294.711; 442.451 294.711; 446.214 294.711; 446.214 294.711; 446.214 294.711; 446.214 294.711; 446.214 294.711; 446.214 294.711; 446.214 294.711; 446.214 294.711; 446.214 294.711; 451.033 294.711; 465.765 294.711; 488.78 294.711; 518.84 294.711; 554.358 294.711; 594.516 294.711; 637.689 294.711; 682.84 294.711; 728.588 294.711; 773.739 294.711; 816.912 294.711; 857.07 294.711; 892.588 294.711; 922.648 294.711; 945.663 294.711; 960.395 294.711; 965.214 294.711; 965.214 294.711"
                          keyTimes="0; 0.166667; 0.183333; 0.2; 0.216667; 0.233333; 0.25; 0.266667; 0.283333; 0.3; 0.316667; 0.333333; 0.35; 0.366667; 0.383333; 0.4; 0.416667; 0.433333; 0.45; 0.466667; 0.483333; 0.5; 0.516667; 0.533333; 0.55; 0.566667; 0.583333; 0.6; 0.616667; 0.633333; 0.65; 0.666667; 0.683333; 0.7; 0.716667; 0.733333; 0.75; 0.766667; 0.783333; 0.8; 0.816667; 0.833333; 1"
                          keySplines="0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1"
                          fill="freeze"
                        />
                        <g transform="rotate(0)">
                          <animateTransform
                            repeatCount="indefinite"
                            type="rotate"
                            attributeName="transform"
                            dur="2.4s"
                            begin="0s"
                            calcMode="spline"
                            values="0; 0; -8; -8"
                            keyTimes="0; 0.55; 0.733333; 1"
                            keySplines="0 0 1 1; 0.333 0 0.667 1; 0 0 1 1"
                            fill="freeze"
                          />
                          <g transform="scale(0.516,0.516) translate(565.786,-88.365)">
                            <path
                              fill="#ffffff"
                              d="M-426.223,75.064C-426.223,82.41,-420.267,88.365,-412.921,88.365C-405.575,88.365,-399.619,82.41,-399.619,75.064C-399.619,67.718,-405.575,61.762,-412.921,61.762C-420.267,61.762,-426.223,67.718,-426.223,75.064Z"
                            />
                            <path
                              fill="#ffffff"
                              d="M-494.992,75.064C-494.992,82.41,-489.036,88.365,-481.69,88.365C-474.344,88.365,-468.389,82.41,-468.389,75.064C-468.389,67.718,-474.344,61.762,-481.69,61.762C-489.036,61.762,-494.992,67.718,-494.992,75.064Z"
                            />
                            <path
                              fill="#ffffff"
                              d="M-560.797,-78.637C-560.797,-78.637,-534.748,-78.637,-534.748,-78.637C-532.309,-78.637,-530.314,-80.631,-530.314,-83.07C-530.314,-83.07,-530.314,-83.07,-530.314,-83.07C-530.314,-85.509,-532.309,-87.504,-534.748,-87.504C-534.748,-87.504,-560.797,-87.504,-560.797,-87.504C-563.236,-87.504,-565.231,-85.509,-565.231,-83.07C-565.231,-83.07,-565.231,-83.07,-565.231,-83.07C-565.231,-80.631,-563.236,-78.637,-560.797,-78.637Z"
                            />
                            <path
                              fill="#ffffff"
                              d="M-498.168,56.404C-498.168,56.404,-393.693,56.404,-393.693,56.404C-391.254,56.404,-389.259,54.409,-389.259,51.97C-389.259,51.97,-389.259,51.97,-389.259,51.97C-389.259,49.531,-391.254,47.536,-393.693,47.536C-393.693,47.536,-498.168,47.536,-498.168,47.536C-500.607,47.536,-502.602,49.531,-502.602,51.97C-502.602,51.97,-502.602,51.97,-502.602,51.97C-502.602,54.409,-500.607,56.404,-498.168,56.404Z"
                            />
                            <path
                              fill="#ffffff"
                              d="M-494.741,50.395C-494.741,50.395,-529.767,-84.188,-529.767,-84.188C-530.381,-86.548,-532.815,-87.976,-535.175,-87.362C-535.175,-87.362,-535.175,-87.362,-535.175,-87.362C-537.535,-86.748,-538.963,-84.314,-538.349,-81.954C-538.349,-81.954,-503.323,52.629,-503.323,52.629C-502.709,54.989,-500.275,56.417,-497.915,55.803C-497.915,55.803,-497.915,55.803,-497.915,55.803C-495.555,55.189,-494.127,52.755,-494.741,50.395Z"
                            />
                            <path
                              fill="#ffffff"
                              d="M-424.734,-56.93C-465.981,-56.772,-504.132,-56.562,-525.565,-56.435C-525.565,-56.435,-525.445,-49.784,-525.445,-49.784C-494.843,-49.965,-459.564,-50.139,-424.734,-50.268C-424.734,-50.268,-424.734,-56.93,-424.734,-56.93Z"
                            />
                            <path
                              fill="#ffffff"
                              d="M-367.573,-56.09C-369.848,-56.781,-393.176,-56.97,-421.817,-56.932C-421.817,-56.932,-421.817,-50.274,-421.817,-50.274C-393.702,-50.324,-372.278,-50.183,-369.408,-49.697C-367.641,-49.14,-367.018,-48.369,-366.8,-47.926C-366.8,-47.926,-388.732,23.35,-388.732,23.35C-388.732,23.35,-505.608,23.35,-505.608,23.35C-505.608,23.35,-505.608,30.001,-505.608,30.001C-505.608,30.001,-383.819,30.001,-383.819,30.001C-383.819,30.001,-360.042,-47.275,-360.042,-47.275C-360.042,-47.275,-360.042,-47.775,-360.042,-47.775C-360.042,-50.015,-361.628,-54.285,-367.573,-56.09Z"
                            />

                            {/* Drop package animation */}
                            <g
                              transform="matrix(1.936,0,0,1.936,-461.643,1.793)"
                              display="none"
                            >
                              <animate
                                repeatCount="indefinite"
                                begin="0s"
                                calcMode="discrete"
                                dur="2.4s"
                                values="none; inline; inline"
                                keyTimes="0; 0.449167; 1"
                                attributeName="display"
                              />
                              <path
                                strokeWidth={0}
                                stroke="#000000"
                                fill="#ffffff"
                                d="M50,-28.5C50,-28.5,-31.25,-28,-31.25,-28C-31.25,-28,-31.5,-27.75,-31.5,-27.75C-31.5,-27.75,50.25,-28,50.25,-28C50.25,-28,50.25,-28,50.25,-28C50.25,-28,50,-28.5,50,-28.5Z"
                              >
                                <animate
                                  repeatCount="indefinite"
                                  attributeName="d"
                                  dur="2.4s"
                                  begin="0s"
                                  calcMode="spline"
                                  values="M50,-28.5C50,-28.5,-31.25,-28,-31.25,-28C-31.25,-28,-31.5,-27.75,-31.5,-27.75C-31.5,-27.75,50.25,-28,50.25,-28C50.25,-28,50.25,-28,50.25,-28C50.25,-28,50,-28.5,50,-28.5Z; M50,-28.5C50,-28.5,-31.25,-28,-31.25,-28C-31.25,-28,-31.5,-27.75,-31.5,-27.75C-31.5,-27.75,50.25,-28,50.25,-28C50.25,-28,50.25,-28,50.25,-28C50.25,-28,50,-28.5,50,-28.5Z; M50,-28.5C50,-28.5,-31.25,-28,-31.25,-28C-31.25,-28,-21,14.25,-21,14.25C-21,14.25,38.25,12.25,38.25,12.25C38.25,12.25,48,-18.5,48,-18.5C48,-18.5,50,-28.5,50,-28.5Z; M50,-28.5C50,-28.5,-31.25,-28,-31.25,-28C-31.25,-28,-21,14.25,-21,14.25C-21,14.25,38.25,12.25,38.25,12.25C38.25,12.25,48,-18.5,48,-18.5C48,-18.5,50,-28.5,50,-28.5Z"
                                  keyTimes="0; 0.45; 0.533333; 1"
                                  keySplines="0 0 1 1; 0.333 0 0.667 1; 0 0 1 1"
                                  fill="freeze"
                                />
                              </path>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
      ) : (
        /* Idle Sleek Button State matching Darsh Dental branding */
        <div
          className="w-full h-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95"
          style={{ backgroundColor: "#12A488", color: "#04110E" }}
        >
          <ShoppingCart className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          <span>Add</span>
        </div>
      )}
    </button>
  );
}

export default AddToCartAnimation;
