import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default (config) => {
    // The Nx Rollup executor will add the typescript plugin.
    // It is configured in project.json to use the modern @rollup/plugin-typescript.
    config.plugins.push(
        nodeResolve(),
        commonjs({
            include: /node_modules/,
            requireReturnsDefault: 'auto',
        }),
    );

    if (config.minify) {
        config.plugins.push(terser());
    }

    return config;
};
