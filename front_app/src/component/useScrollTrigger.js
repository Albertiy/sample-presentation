import { useState, useEffect } from "react";

function defaultTrigger(options) {
    let threshold = options.threshold === void 0 ? 100 : options.threshold;
    let target = options.target;

    let current;

    if (target) {
        current = target.pageYOffset !== undefined ? target.pageYOffset : target.scrollTop;
        console.log('current: ' + current)
    }

    return current > threshold;
}

const defaultTarget = typeof window !== 'undefined' ? window : null;

/**
 * 模仿mui的hook
 * @param {{target?: Node | Window, threshold?: number}} [options] 
 * @returns 
 */
const useScrollTrigger = (options = {}) => {

    // void 0 返回 undefined，防止 undefined 被重写
    let target = options.target === void 0 ? defaultTarget : options.target;
    let threshold = options.target === void 0 ? 100 : options.threshold;
    let getTrigger = defaultTrigger;

    const [trigger, setTrigger] = useState(false);

    let checkScroll = () => {
        console.log('checkScroll')
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