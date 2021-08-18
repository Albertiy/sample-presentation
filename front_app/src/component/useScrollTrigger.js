import { useState, useEffect } from "react";

function defaultTrigger(options) {
    let threshold = options.threshold === void 0 ? 100 : options.threshold;
    let target = options.target;

    let current;

    if (target) {
        // window 有 pageYOffset，其他元素没有
        // scrollTop 是外包元素内的滚动距离，锚点元素永远是0
        // window 没有 getBoundingClientRect，其他元素有。
        if (target.getBoundingClientRect)
            current = target.getBoundingClientRect().top;
        else
            current = target.pageYOffset !== undefined ? target.pageYOffset : target.scrollTop;
        console.log('current: ' + current)
    }

    return Math.abs(current) > threshold;
}

const defaultTarget = typeof window !== 'undefined' ? window : null;

/**
 * 模仿mui的hook
 * @param {{target?: Node | Window, threshold?: number}} [options] 
 * @returns 
 */
const useScrollTrigger = (options = {}) => {

    console.log('options: %o', options)

    // void 0 返回 undefined，防止 undefined 被重写
    let target = options.target === void 0 || options.target === null ? defaultTarget : options.target;
    let threshold = options.target === void 0 || options.target === null ? 100 : options.threshold;
    let getTrigger = defaultTrigger;

    console.log('%O', target);

    const [trigger, setTrigger] = useState(false);

    let checkScroll = () => {
        setTrigger(getTrigger({ threshold: threshold, target: target }))
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('scroll', checkScroll);
        return () => window.removeEventListener('scroll', checkScroll);
    }, []);

    return trigger;
}

export default useScrollTrigger;