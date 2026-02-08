import { motion } from 'framer-motion';

const charVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
        opacity: 1,
        transition: {
            delay: i * 0.03,
            duration: 0.02,
        },
    }),
};

export function Logo() {
    const slashes = ['/', '/', '/'];
    const backslash = '\\';
    const text = 'webaffe'.split('');

    return (
        <motion.div
            className="flex items-center gap-2 cursor-pointer"
            initial="hidden"
            animate="visible"
        >
            <div className="flex items-center text-accent font-bold text-2xl" style={{ fontFamily: 'Gilroy-Bold, sans-serif' }}>
                <div className="flex mr-2 text-3xl tracking-tighter">
                    {slashes.map((char, index) => (
                        <motion.span
                            key={`slash-${index}`}
                            custom={index}
                            variants={charVariants}
                            className="text-bolt-elements-textPrimary"
                        >
                            {char}
                        </motion.span>
                    ))}
                    <motion.span
                        custom={3}
                        variants={charVariants}
                        className="text-accent"
                    >
                        {backslash}
                    </motion.span>
                </div>
                <div className="flex">
                    {text.map((char, index) => (
                        <motion.span
                            key={`char-${index}`}
                            custom={4 + index}
                            variants={charVariants}
                        >
                            {char}
                        </motion.span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
