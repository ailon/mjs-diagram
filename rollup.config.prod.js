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
    input: ['./src/viewer_index.ts', './src/editor_index.ts', './src/index.ts'],
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
    input: './dts/viewer_index.d.ts',
    output: [{ file: './dist/viewer.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: './dts/editor_index.d.ts',
    output: [{ file: './dist/editor.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: './dts/index.d.ts',
    output: [{ file: outputDir + pkg.types, format: 'es' }],
    plugins: [dts()],
  },
  {
    input: ['src/viewer_index.ts'],
    output: [
      {
        file: outputDir + 'viewer.esm.js',
        format: 'es',
        sourcemap: true,
        banner: banner,
      },
      {
        file: outputDir + 'viewer.js',
        name: 'mjsdviewer',
        format: 'umd',
        sourcemap: true,
        banner: banner,
      },
    ],
    plugins: [typescript(), svgo(), terser()],
  },
  {
    input: ['src/editor_index.ts'],
    output: [
      {
        file: outputDir + 'editor.esm.js',
        format: 'es',
        sourcemap: true,
        banner: banner,
      },
      {
        file: outputDir + 'editor.js',
        name: 'mjsdeditor',
        format: 'umd',
        sourcemap: true,
        banner: banner,
      },
    ],
    plugins: [nodeResolve(), typescript(), svgo(), terser()],
  },
  {
    input: ['src/index.ts'],
    output: [
      {
        file: outputDir + pkg.module,
        format: 'es',
        sourcemap: true,
        banner: banner,
      },
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
