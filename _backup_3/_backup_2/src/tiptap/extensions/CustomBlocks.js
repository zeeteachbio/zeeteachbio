import { Node, mergeAttributes } from '@tiptap/core';

// Info Box (blue)
export const InfoBox = Node.create({
    name: 'infoBox',
    group: 'block',
    content: 'block+',

    addAttributes() {
        return {
            class: {
                default: 'custom-block info-box',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div.info-box',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'custom-block info-box' }), 0];
    },

    addCommands() {
        return {
            setInfoBox: () => ({ commands }) => {
                return commands.wrapIn(this.name);
            },
        };
    },
});

// Warning Box (yellow)
export const WarningBox = Node.create({
    name: 'warningBox',
    group: 'block',
    content: 'block+',

    addAttributes() {
        return {
            class: {
                default: 'custom-block warning-box',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div.warning-box',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'custom-block warning-box' }), 0];
    },

    addCommands() {
        return {
            setWarningBox: () => ({ commands }) => {
                return commands.wrapIn(this.name);
            },
        };
    },
});

// Success Box (green)
export const SuccessBox = Node.create({
    name: 'successBox',
    group: 'block',
    content: 'block+',

    addAttributes() {
        return {
            class: {
                default: 'custom-block success-box',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div.success-box',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'custom-block success-box' }), 0];
    },

    addCommands() {
        return {
            setSuccessBox: () => ({ commands }) => {
                return commands.wrapIn(this.name);
            },
        };
    },
});

// Tip Box (neutral)
export const TipBox = Node.create({
    name: 'tipBox',
    group: 'block',
    content: 'block+',

    addAttributes() {
        return {
            class: {
                default: 'custom-block tip-box',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div.tip-box',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'custom-block tip-box' }), 0];
    },

    addCommands() {
        return {
            setTipBox: () => ({ commands }) => {
                return commands.wrapIn(this.name);
            },
        };
    },
});

// Biology Highlight Box (custom style)
export const BiologyBox = Node.create({
    name: 'biologyBox',
    group: 'block',
    content: 'block+',

    addAttributes() {
        return {
            class: {
                default: 'custom-block biology-box',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div.biology-box',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'custom-block biology-box' }), 0];
    },

    addCommands() {
        return {
            setBiologyBox: () => ({ commands }) => {
                return commands.wrapIn(this.name);
            },
        };
    },
});
