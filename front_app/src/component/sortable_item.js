import PropTypes from 'prop-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Dnd-kit 排序元素
 * @param {*} props 
 * @returns 
 */
function SortableItem(props) {
    const { children, id } = props;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children ? children : (<div>{id}</div>)}
        </div>
    );
}

SortableItem.prototype = {
    id: PropTypes.string.isRequired,
}

export default SortableItem;