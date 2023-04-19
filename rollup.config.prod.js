import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import svgo from 'rollup-plugin-svgo';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const outputDir = './dist/';

const banner = `/* **********************************
MJS Diagram version ${pkg.version}
https://markerjs.com

copyright Alan Mendelevich
see README.md and LICENSE for details
********************************** */`;

export default [
  {
    input: ['./src/core.ts', './src/viewer.ts', './src/editor.ts'],
    output: {
      dir: './dts/',
    },
    plugins: [
      del({ targets: ['dts/*', 'dist/*'] }),
      nodeResolve(),
      typescript({
        declaration: true,
        outDir: './dts/',
        rootDir: './src/',
        exclude: ['./test/**/*', './dts/**/*', './dist/**/*'],
      }),
      svgo(),
    ],
  },
  {
    input: './dts/core.d.ts',
    output: [{ file: outputDir + pkg.types, format: 'es' }],
    plugins: [dts()],
  },
  {
    input: './dts/viewer.d.ts',
    output: [{ file: './dist/viewer.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: './dts/editor.d.ts',
    output: [{ file: './dist/editor.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: 'src/core.ts',
    output: [
      {
        file: outputDir + 'core.js',
        format: 'es',
        sourcemap: true,
        banner: banner,
      },
      // {
      //   file: outputDir + 'core.js',
      //   name: 'mjsdcore',
      //   format: 'umd',
      //   sourcemap: true,
      //   banner: banner,
      // },
    ],
    plugins: [
      typescript({
        compilerOptions: {
          rootDir: './src/',
        },
      }),
      svgo(),
      terser(),
    ],
  },
  {
    input: 'src/viewer.ts',
    output: [
      {
        file: outputDir + 'viewer.js',
        format: 'es',
        sourcemap: true,
        banner: banner,
      },
      // {
      //   file: outputDir + 'viewer.js',
      //   name: 'mjsdviewer',
      //   format: 'umd',
      //   sourcemap: true,
      //   banner: banner,
      // },
    ],
    external: [
      './index',
      './core'
    ],
    plugins: [
      typescript({
        compilerOptions: {
          rootDir: './src/',
        },
      }),
      svgo(),
      terser(),
    ],
  },
  {
    input: ['src/editor.ts'],
    output: [
      {
        file: outputDir + 'editor.js',
        format: 'es',
        sourcemap: true,
        banner: banner,
      },
      // {
      //   file: outputDir + 'editor.js',
      //   name: 'mjsdeditor',
      //   format: 'umd',
      //   sourcemap: true,
      //   banner: banner,
      // },
    ],
    external: [
      /^(\.\.?\/)*core$/
    ],
    plugins: [
      nodeResolve(), 
      typescript({
        compilerOptions: {
          rootDir: './src/',
        },
      }), svgo(), terser()],
  },
  {
    input: ['src/stencilsets/mindmap/mindmap.ts'],
    output: [
      {
        file: outputDir + 'stencilsets/mindmap/mindmap.js',
        format: 'es',
        sourcemap: true,
        banner: banner,
      },
      // {
      //   file: outputDir + 'editor.js',
      //   name: 'mjsdeditor',
      //   format: 'umd',
      //   sourcemap: true,
      //   banner: banner,
      // },
    ],
    external: [
      /^(\.\.?\/)*core$/,
      /^(\.\.?\/)*editor$/,
      /^(\.\.?\/)*viewer$/,
    ],
    plugins: [typescript(), svgo(), terser()],
  },
  {
    input: ['src/index.ts'],
    output: [
      // {
      //   file: outputDir + pkg.module,
      //   format: 'es',
      //   sourcemap: true,
      //   banner: banner,
      // },
      {
        file: outputDir + pkg.main,
        name: 'mjsdiagram',
        format: 'umd',
        sourcemap: true,
        banner: banner,
      },
    ],
    plugins: [
      nodeResolve(),
      generatePackageJson({
        baseContents: (pkg) => {
          pkg.scripts = {};
          pkg.dependencies = {};
          pkg.devDependencies = {};
          return pkg;
        },
      }),
      typescript(),
      svgo(),
      terser(),
      copy({
        targets: [
          {
            src: 'README.md',
            dest: 'dist',
          },
          {
            src: 'LICENSE',
            dest: 'dist',
          },
        ],
      }),
      del({ targets: ['dts/*'] }),
    ],
  },
];
