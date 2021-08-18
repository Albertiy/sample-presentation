import Head from 'next/head'

import styles from '/styles/management.category.module.css'

import { DndContext, useDroppable, useDraggable } from '@dnd-kit/core';

function Draggable(props) {
    const { isOver, setNodeRef } = useDroppable({ id: 'droppable', });
    const style = { color: isOver ? 'green' : undefined, };
    return (<div ref={setNodeRef} style={style}>
        {props.children}
    </div>)
}

function Droppable(props) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: 'draggable', });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
    return (<button ref={setNodeRef} style={style} {...listeners} {...attributes}>
        {props.children}
    </button>)
}

export default function Cagegory() {
    return (
        <div>
            <Head>
                <title>素材管理 - 类目管理</title>
                <link rel="icon" href="/img/picturex64m.png" />
            </Head>
            <header>
                Category
            </header>
            <main>
                <DndContext>
                    <Draggable></Draggable>
                    <Droppable></Droppable>
                </DndContext>
            </main>
            <footer>

            </footer>
        </div>
    );
}