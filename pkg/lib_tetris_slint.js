let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_30(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h2197cf505c1a5f5b(arg0, arg1, addHeapObject(arg2));
}

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
                state.a = 0;

            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_35(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__Fn__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h0328b66d5d4cfa1d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_56(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8550d8cc7e91273c(arg0, arg1);
}

function __wbg_adapter_59(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hcb5bad3238be932b(arg0, arg1, addHeapObject(arg2));
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }
/**
*/
export function main() {
    wasm.main();
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

let cachedFloat32Memory0 = null;

function getFloat32Memory0() {
    if (cachedFloat32Memory0 === null || cachedFloat32Memory0.byteLength === 0) {
        cachedFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32Memory0;
}

function getArrayF32FromWasm0(ptr, len) {
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function getImports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_now_95ea73dc51c3fbaa = typeof Date.now == 'function' ? Date.now : notDefined('Date.now');
    imports.wbg.__wbg_crypto_70a96de3b6b73dac = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_process_dd1577445152112e = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_58036bec3add9e6f = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_6a9d28205ed5b0d8 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_msCrypto_adbc770ec9eca9c7 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_f05d779769764e82 = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_3774744e221a22ad = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_randomFillSync_e950366c42764a07 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_log_25f51ae9894b769a = function(arg0, arg1) {
        console.log(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_bindVertexArray_8b71290041cb6746 = function(arg0, arg1) {
        getObject(arg0).bindVertexArray(getObject(arg1));
    };
    imports.wbg.__wbg_bufferData_16f948547d74c866 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__wbg_createVertexArray_de7292bbd7ea02dd = function(arg0) {
        const ret = getObject(arg0).createVertexArray();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteVertexArray_dc4f1b2e5ac93f24 = function(arg0, arg1) {
        getObject(arg0).deleteVertexArray(getObject(arg1));
    };
    imports.wbg.__wbg_texImage2D_8fbe9abcfb4a7c9d = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_6a8b0f3381d734c3 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_e7a6bf1f1984b59d = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_53b6a050a0b9b24e = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
    }, arguments) };
    imports.wbg.__wbg_uniform2fv_ffd0b1d3c3a4070a = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform2fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform4fv_26d822da5c3fdb00 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_activeTexture_0daf7c1698e49f00 = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__wbg_attachShader_3038234860d2d59d = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_bindAttribLocation_c3227ea9f269a0e8 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).bindAttribLocation(getObject(arg1), arg2 >>> 0, getStringFromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_bindBuffer_9cb064991696b79f = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindFramebuffer_0522db2a250c29f0 = function(arg0, arg1, arg2) {
        getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindRenderbuffer_1e4928d9bf839c02 = function(arg0, arg1, arg2) {
        getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindTexture_0c284b1604ba527c = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_blendFuncSeparate_9a7146974b3cd76d = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_checkFramebufferStatus_1ada38c590894ad9 = function(arg0, arg1) {
        const ret = getObject(arg0).checkFramebufferStatus(arg1 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_clear_c9cc4f9c9ed47946 = function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    };
    imports.wbg.__wbg_clearColor_fbabf47cdedcd16c = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_colorMask_a7f067283ed312c9 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__wbg_compileShader_af777dd3b15798b3 = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__wbg_createBuffer_5ed0554ab35780b5 = function(arg0) {
        const ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createFramebuffer_86883935c13ddd59 = function(arg0) {
        const ret = getObject(arg0).createFramebuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createProgram_7d25c1dd3bb0ce39 = function(arg0) {
        const ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createRenderbuffer_b392324e044d389a = function(arg0) {
        const ret = getObject(arg0).createRenderbuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createShader_96339db58713e350 = function(arg0, arg1) {
        const ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_c651f9e28d1ce9d2 = function(arg0) {
        const ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_cullFace_79e4ddbea13278b3 = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_deleteBuffer_cf67a696a7857b3f = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteFramebuffer_f9c2bceeb5422d9d = function(arg0, arg1) {
        getObject(arg0).deleteFramebuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteProgram_9c8fa1ef341cb01d = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__wbg_deleteRenderbuffer_cad502ac8d1398f2 = function(arg0, arg1) {
        getObject(arg0).deleteRenderbuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteShader_f48f72524f5ee3ed = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__wbg_deleteTexture_1b5f5e536e0d5545 = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__wbg_detachShader_e1817cff5917432b = function(arg0, arg1, arg2) {
        getObject(arg0).detachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_disable_3adb8645ea1d92d4 = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__wbg_disableVertexAttribArray_f469283fda607cee = function(arg0, arg1) {
        getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_drawArrays_84de8a2416396807 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_enable_1ac9f14a577b7c8b = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__wbg_enableVertexAttribArray_53139716d9c95dba = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_framebufferRenderbuffer_77bdb2f359a5728f = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
    };
    imports.wbg.__wbg_framebufferTexture2D_885176f16a153fec = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
    };
    imports.wbg.__wbg_frontFace_3d7784c56ffede8a = function(arg0, arg1) {
        getObject(arg0).frontFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_generateMipmap_53e792272d028c87 = function(arg0, arg1) {
        getObject(arg0).generateMipmap(arg1 >>> 0);
    };
    imports.wbg.__wbg_getError_a472f86b6aa9ea71 = function(arg0) {
        const ret = getObject(arg0).getError();
        return ret;
    };
    imports.wbg.__wbg_getProgramInfoLog_7654794297967ac0 = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getProgramParameter_5b1a40917aa850f8 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getShaderInfoLog_915d0e8506c11159 = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getShaderParameter_f9240892c9e7a0a3 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getUniformLocation_c6caabb349b43da7 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_linkProgram_2d5cc584654696b8 = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__wbg_pixelStorei_a0b83efc92cd29fe = function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_renderbufferStorage_2192d9cd09128339 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
    };
    imports.wbg.__wbg_scissor_2b084e0dc81d67f4 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_shaderSource_57883245cdfb0dca = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_stencilFunc_37e7babdab19c8f2 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilFunc(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__wbg_stencilMask_144b86d15d9fdbe6 = function(arg0, arg1) {
        getObject(arg0).stencilMask(arg1 >>> 0);
    };
    imports.wbg.__wbg_stencilOp_e0786cc216aa1f86 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilOp(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_stencilOpSeparate_1708aea1aea0dc48 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_texParameteri_e0ce3810261e0864 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_uniform1i_4fdc6d6740375d22 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_useProgram_2f4094faf45ecba1 = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__wbg_vertexAttribPointer_ad370785358334f4 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__wbg_viewport_cc41e28a71c23915 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_instanceof_Window_e266f02eee43b570 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_document_950215a728589a2d = function(arg0) {
        const ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_innerWidth_7e9d12e05bcb598e = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).innerWidth;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_innerHeight_3ef25a30618357e0 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).innerHeight;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_devicePixelRatio_5f8f5cab76864090 = function(arg0) {
        const ret = getObject(arg0).devicePixelRatio;
        return ret;
    };
    imports.wbg.__wbg_cancelAnimationFrame_d079cdb83bc43b26 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).cancelAnimationFrame(arg1);
    }, arguments) };
    imports.wbg.__wbg_matchMedia_967e50e4289050fa = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_requestAnimationFrame_afe426b568f84138 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_e6ae480a4b8df368 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0)[getStringFromWasm0(arg1, arg2)];
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_clearTimeout_b2b8af0f044e02e9 = function(arg0, arg1) {
        getObject(arg0).clearTimeout(arg1);
    };
    imports.wbg.__wbg_setTimeout_6609c9aa64f32bfc = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_matches_46e979ff3e4d0811 = function(arg0) {
        const ret = getObject(arg0).matches;
        return ret;
    };
    imports.wbg.__wbg_now_c644db5194be8437 = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_get_36817a0b6bd3b305 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg1)[getStringFromWasm0(arg2, arg3)];
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_instanceof_HtmlCanvasElement_f5f69dab93281ebe = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof HTMLCanvasElement;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_width_a40e21a22129b197 = function(arg0) {
        const ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_setwidth_81c62bc806e0a727 = function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    };
    imports.wbg.__wbg_height_98d51321254345a5 = function(arg0) {
        const ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_setheight_98cf0db22c40ef07 = function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    };
    imports.wbg.__wbg_getContext_3ae404b649cf9287 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getContext_89a318b610dc5fd4 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_clientX_35f23f953e04ec0e = function(arg0) {
        const ret = getObject(arg0).clientX;
        return ret;
    };
    imports.wbg.__wbg_clientY_8104e462abc0b3ec = function(arg0) {
        const ret = getObject(arg0).clientY;
        return ret;
    };
    imports.wbg.__wbg_offsetX_413d9f02022e72ad = function(arg0) {
        const ret = getObject(arg0).offsetX;
        return ret;
    };
    imports.wbg.__wbg_offsetY_488f80a0a9666028 = function(arg0) {
        const ret = getObject(arg0).offsetY;
        return ret;
    };
    imports.wbg.__wbg_ctrlKey_e1b8f1de1eb24d5d = function(arg0) {
        const ret = getObject(arg0).ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_shiftKey_fdd99b6df96e25c5 = function(arg0) {
        const ret = getObject(arg0).shiftKey;
        return ret;
    };
    imports.wbg.__wbg_altKey_d531a4d3704557cb = function(arg0) {
        const ret = getObject(arg0).altKey;
        return ret;
    };
    imports.wbg.__wbg_metaKey_934772989e28020c = function(arg0) {
        const ret = getObject(arg0).metaKey;
        return ret;
    };
    imports.wbg.__wbg_button_a1c470d5e4c997f2 = function(arg0) {
        const ret = getObject(arg0).button;
        return ret;
    };
    imports.wbg.__wbg_buttons_42a7b7de33d8e572 = function(arg0) {
        const ret = getObject(arg0).buttons;
        return ret;
    };
    imports.wbg.__wbg_movementX_f4d07f6658c1e16f = function(arg0) {
        const ret = getObject(arg0).movementX;
        return ret;
    };
    imports.wbg.__wbg_movementY_30276c1f90aec4fa = function(arg0) {
        const ret = getObject(arg0).movementY;
        return ret;
    };
    imports.wbg.__wbg_charCode_504e79c3e550d1bb = function(arg0) {
        const ret = getObject(arg0).charCode;
        return ret;
    };
    imports.wbg.__wbg_keyCode_b33194be2ceec53b = function(arg0) {
        const ret = getObject(arg0).keyCode;
        return ret;
    };
    imports.wbg.__wbg_altKey_dff2a075455ac01b = function(arg0) {
        const ret = getObject(arg0).altKey;
        return ret;
    };
    imports.wbg.__wbg_ctrlKey_993b558f853d64ce = function(arg0) {
        const ret = getObject(arg0).ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_shiftKey_31e62e9d172b26f0 = function(arg0) {
        const ret = getObject(arg0).shiftKey;
        return ret;
    };
    imports.wbg.__wbg_metaKey_9f0f19692d0498bd = function(arg0) {
        const ret = getObject(arg0).metaKey;
        return ret;
    };
    imports.wbg.__wbg_isComposing_ce52afdb1bf63db2 = function(arg0) {
        const ret = getObject(arg0).isComposing;
        return ret;
    };
    imports.wbg.__wbg_key_f0decac219aa904b = function(arg0, arg1) {
        const ret = getObject(arg1).key;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_code_aed21120de275a12 = function(arg0, arg1) {
        const ret = getObject(arg1).code;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getModifierState_03b72700dbe33ad6 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getModifierState(getStringFromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbg_setProperty_21e2e7868b86a93e = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_addEventListener_615d4590d38da1c9 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    }, arguments) };
    imports.wbg.__wbg_addEventListener_cf5b03cd29763277 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
    }, arguments) };
    imports.wbg.__wbg_removeEventListener_343e3ea9fe4c8533 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
    }, arguments) };
    imports.wbg.__wbg_target_b629c177f9bee3da = function(arg0) {
        const ret = getObject(arg0).target;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_cancelBubble_c9a8182589205d54 = function(arg0) {
        const ret = getObject(arg0).cancelBubble;
        return ret;
    };
    imports.wbg.__wbg_preventDefault_16b2170b12f56317 = function(arg0) {
        getObject(arg0).preventDefault();
    };
    imports.wbg.__wbg_stopPropagation_7647c9985222f9b0 = function(arg0) {
        getObject(arg0).stopPropagation();
    };
    imports.wbg.__wbg_matches_7b5ad9e6bb56f1f3 = function(arg0) {
        const ret = getObject(arg0).matches;
        return ret;
    };
    imports.wbg.__wbg_addListener_dfc3f9e430149b14 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).addListener(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_removeListener_6f811d2fb59768b9 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).removeListener(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_data_70b505c651722930 = function(arg0, arg1) {
        const ret = getObject(arg1).data;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_x_0938e87a3ff14a2e = function(arg0) {
        const ret = getObject(arg0).x;
        return ret;
    };
    imports.wbg.__wbg_y_b881176a43492948 = function(arg0) {
        const ret = getObject(arg0).y;
        return ret;
    };
    imports.wbg.__wbg_isComposing_9e753f8f621f0a2a = function(arg0) {
        const ret = getObject(arg0).isComposing;
        return ret;
    };
    imports.wbg.__wbg_inputType_7b94ebaece91d0d2 = function(arg0, arg1) {
        const ret = getObject(arg1).inputType;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_data_8a7474dc7669b509 = function(arg0, arg1) {
        const ret = getObject(arg1).data;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_pointerId_d2caae4465ba386f = function(arg0) {
        const ret = getObject(arg0).pointerId;
        return ret;
    };
    imports.wbg.__wbg_pressure_352c13794490720b = function(arg0) {
        const ret = getObject(arg0).pressure;
        return ret;
    };
    imports.wbg.__wbg_pointerType_df759fa0bd6634ed = function(arg0, arg1) {
        const ret = getObject(arg1).pointerType;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_fullscreenElement_65f14a4df7c25129 = function(arg0) {
        const ret = getObject(arg0).fullscreenElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createElement_e2a0e21263eb5416 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getElementById_eb93a47327bb5585 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_id_ede586da8dca1c27 = function(arg0, arg1) {
        const ret = getObject(arg1).id;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_clientWidth_1fa51f20a3bebbbf = function(arg0) {
        const ret = getObject(arg0).clientWidth;
        return ret;
    };
    imports.wbg.__wbg_clientHeight_0fe149fdad1fe046 = function(arg0) {
        const ret = getObject(arg0).clientHeight;
        return ret;
    };
    imports.wbg.__wbg_getBoundingClientRect_aaa701cbcb448965 = function(arg0) {
        const ret = getObject(arg0).getBoundingClientRect();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_matches_bda2f7b6478030a6 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).matches(getStringFromWasm0(arg1, arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_requestFullscreen_4eee04b9090fa98a = function() { return handleError(function (arg0) {
        getObject(arg0).requestFullscreen();
    }, arguments) };
    imports.wbg.__wbg_setAttribute_79c9562d32d05e66 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_setPointerCapture_5479dc0d082282b7 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).setPointerCapture(arg1);
    }, arguments) };
    imports.wbg.__wbg_before_44f875c751453be4 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).before(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_dataset_704ec547006a213c = function(arg0) {
        const ret = getObject(arg0).dataset;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_style_2141664e428fef46 = function(arg0) {
        const ret = getObject(arg0).style;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_offsetTop_17972c95c5a34103 = function(arg0) {
        const ret = getObject(arg0).offsetTop;
        return ret;
    };
    imports.wbg.__wbg_offsetLeft_0ef17ef919c0a196 = function(arg0) {
        const ret = getObject(arg0).offsetLeft;
        return ret;
    };
    imports.wbg.__wbg_offsetWidth_56caa7d0f7e171a2 = function(arg0) {
        const ret = getObject(arg0).offsetWidth;
        return ret;
    };
    imports.wbg.__wbg_offsetHeight_31cde48f5fbc2368 = function(arg0) {
        const ret = getObject(arg0).offsetHeight;
        return ret;
    };
    imports.wbg.__wbg_focus_6497e1b44dabfb24 = function() { return handleError(function (arg0) {
        getObject(arg0).focus();
    }, arguments) };
    imports.wbg.__wbg_instanceof_WebGlRenderingContext_1f34d107adf90e57 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WebGLRenderingContext;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_bufferData_023700b2ed207c43 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__wbg_texImage2D_40b43ed3876db607 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_57792696288b0a61 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_82a3f688d5a25057 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
    }, arguments) };
    imports.wbg.__wbg_uniform2fv_c29ce786946f1aae = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform2fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform4fv_14f1c5ef10bfb4c9 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_activeTexture_01d5469eb22c10e7 = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__wbg_attachShader_14fb12e2ae589dc3 = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_bindAttribLocation_2121f21def355658 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).bindAttribLocation(getObject(arg1), arg2 >>> 0, getStringFromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_bindBuffer_b7c382dcd70e33f6 = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindFramebuffer_a5ab0ed0463586cb = function(arg0, arg1, arg2) {
        getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindRenderbuffer_2d67c879cdbe5ea9 = function(arg0, arg1, arg2) {
        getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindTexture_c1c0e00507424f8e = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_blendFuncSeparate_b508053691b6ebbe = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_checkFramebufferStatus_57f4c7226f4234a5 = function(arg0, arg1) {
        const ret = getObject(arg0).checkFramebufferStatus(arg1 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_clear_edebb12717625e22 = function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    };
    imports.wbg.__wbg_clearColor_8758a0aef2ed52e4 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_colorMask_99120a2c8caf1298 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__wbg_compileShader_4e9130ccbd4a0238 = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__wbg_createBuffer_8c64250e5283611c = function(arg0) {
        const ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createFramebuffer_1f943a32c748753e = function(arg0) {
        const ret = getObject(arg0).createFramebuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createProgram_28db0ff3cee5f71a = function(arg0) {
        const ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createRenderbuffer_a76dcfda7bdc749a = function(arg0) {
        const ret = getObject(arg0).createRenderbuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createShader_c5fcd8592f47b510 = function(arg0, arg1) {
        const ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_81fd93af28301e0e = function(arg0) {
        const ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_cullFace_d4450f8718c6b3eb = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_deleteBuffer_17feed38f3a70ec9 = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteFramebuffer_130abca01c89b7d6 = function(arg0, arg1) {
        getObject(arg0).deleteFramebuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteProgram_dd5f0e2bc555e270 = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__wbg_deleteRenderbuffer_385f3c9e8759b99e = function(arg0, arg1) {
        getObject(arg0).deleteRenderbuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteShader_fac9fb3cdefdf6ec = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__wbg_deleteTexture_605a36a7e380df5f = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__wbg_detachShader_925c73dc92b1f7ac = function(arg0, arg1, arg2) {
        getObject(arg0).detachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_disable_65425605098b79cf = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__wbg_disableVertexAttribArray_cf25f8beb5872364 = function(arg0, arg1) {
        getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_drawArrays_e5fa3cfc2b5d7c6d = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_enable_2c3b6a4692af9b1b = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__wbg_enableVertexAttribArray_6dd3d0668209ae19 = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_framebufferRenderbuffer_3bf1420713a0b21a = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
    };
    imports.wbg.__wbg_framebufferTexture2D_ed03c0674b9979ce = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
    };
    imports.wbg.__wbg_frontFace_00177185d2fae697 = function(arg0, arg1) {
        getObject(arg0).frontFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_generateMipmap_317717f51c04cec9 = function(arg0, arg1) {
        getObject(arg0).generateMipmap(arg1 >>> 0);
    };
    imports.wbg.__wbg_getError_c96479731e168333 = function(arg0) {
        const ret = getObject(arg0).getError();
        return ret;
    };
    imports.wbg.__wbg_getExtension_d1151f6038b08ca5 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getParameter_d6cd2dd2cde656ec = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getParameter(arg1 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getProgramInfoLog_7fd2a7c6c1a280c1 = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getProgramParameter_af1cfcccbbc80f71 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getShaderInfoLog_d057293074e59c61 = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getShaderParameter_685d7d7092c6bae6 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getSupportedExtensions_4a52f9e74bd462b2 = function(arg0) {
        const ret = getObject(arg0).getSupportedExtensions();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getUniformLocation_b46e5db76599a918 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_linkProgram_ca9df3fba2fd4125 = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__wbg_pixelStorei_f97b971917582269 = function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_renderbufferStorage_37eab84be1494aef = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
    };
    imports.wbg.__wbg_scissor_8bc2e761846f53f0 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_shaderSource_457e8bc42050401d = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_stencilFunc_c330e345b19b0f38 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilFunc(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__wbg_stencilMask_e1887eeaabe22771 = function(arg0, arg1) {
        getObject(arg0).stencilMask(arg1 >>> 0);
    };
    imports.wbg.__wbg_stencilOp_05f38c743b7da372 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilOp(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_stencilOpSeparate_aa3d09aa448a6f48 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_texParameteri_9fbb09bbf9670af4 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_uniform1i_1f8256271b54cf41 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_useProgram_6c9019d05fb8d280 = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__wbg_vertexAttribPointer_ccabef9be68fe1c4 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__wbg_viewport_4bdfc4b8959593ee = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_error_2d344a50ccf38b3b = function(arg0, arg1) {
        console.error(getObject(arg0), getObject(arg1));
    };
    imports.wbg.__wbg_instanceof_HtmlInputElement_5c9d54338207f061 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof HTMLInputElement;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_setvalue_a706abe70dab1b65 = function(arg0, arg1, arg2) {
        getObject(arg0).value = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_instanceof_CanvasRenderingContext2d_3e95629461ed9f67 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof CanvasRenderingContext2D;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_setfillStyle_b065cfad34a78974 = function(arg0, arg1) {
        getObject(arg0).fillStyle = getObject(arg1);
    };
    imports.wbg.__wbg_setfont_5ff88bdcda655052 = function(arg0, arg1, arg2) {
        getObject(arg0).font = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_fillText_1c8a94ba170ba3ee = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).fillText(getStringFromWasm0(arg1, arg2), arg3, arg4);
    }, arguments) };
    imports.wbg.__wbg_src_a7a61faadd7cb081 = function(arg0, arg1) {
        const ret = getObject(arg1).src;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_width_3cb3a813440daf4e = function(arg0) {
        const ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_setwidth_34a7ac48fc12ed0b = function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    };
    imports.wbg.__wbg_height_eefd5cf09a6ddc03 = function(arg0) {
        const ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_setheight_954a61b1429caeba = function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    };
    imports.wbg.__wbg_naturalWidth_8da5381283fe38c9 = function(arg0) {
        const ret = getObject(arg0).naturalWidth;
        return ret;
    };
    imports.wbg.__wbg_naturalHeight_9bff7c293da75b6e = function(arg0) {
        const ret = getObject(arg0).naturalHeight;
        return ret;
    };
    imports.wbg.__wbg_currentSrc_77392fa8d0a230f2 = function(arg0, arg1) {
        const ret = getObject(arg1).currentSrc;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_bindVertexArrayOES_688eba003a98a0bb = function(arg0, arg1) {
        getObject(arg0).bindVertexArrayOES(getObject(arg1));
    };
    imports.wbg.__wbg_createVertexArrayOES_02cfe655604046eb = function(arg0) {
        const ret = getObject(arg0).createVertexArrayOES();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteVertexArrayOES_ba22911f739464a7 = function(arg0, arg1) {
        getObject(arg0).deleteVertexArrayOES(getObject(arg1));
    };
    imports.wbg.__wbg_deltaX_b7d127c94d6265c0 = function(arg0) {
        const ret = getObject(arg0).deltaX;
        return ret;
    };
    imports.wbg.__wbg_deltaY_b32fa858e16edcc0 = function(arg0) {
        const ret = getObject(arg0).deltaY;
        return ret;
    };
    imports.wbg.__wbg_deltaMode_11f7b19e64d9a515 = function(arg0) {
        const ret = getObject(arg0).deltaMode;
        return ret;
    };
    imports.wbg.__wbg_get_27fe3dac1c4d0224 = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_e498fbc24f9c1d4f = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_newnoargs_2b8b6bd7753c76ba = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_baf4855f9a986186 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_95d1ea488d03e4e8 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_f9876326328f45ed = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_e7c1f827057f6584 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_a09ec664e14b1b81 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_87cbb8506fecf3a9 = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_c85a9259e621f3db = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_call_9495de66fdbe016b = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_is_8f1618fe9a4fd388 = function(arg0, arg1) {
        const ret = Object.is(getObject(arg0), getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_buffer_cf65c07de34b9a08 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_55f9ffb569d9fa74 = function(arg0, arg1, arg2) {
        const ret = new Int8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_f477e654086cbbb6 = function(arg0, arg1, arg2) {
        const ret = new Int16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_b57a602974d4b1cd = function(arg0, arg1, arg2) {
        const ret = new Int32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_9fb2f11355ecadf5 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_537b7341ce90bb31 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_17499e8aa4003ebd = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_9241d9d251418ebf = function(arg0, arg1, arg2) {
        const ret = new Uint16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_5c5a6e21987c3bee = function(arg0, arg1, arg2) {
        const ret = new Uint32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_4078d56428eb2926 = function(arg0, arg1, arg2) {
        const ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_b56c882b57805732 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_7526649b91a252a6 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_6aa458a4ebdb65cb = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1046 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_30);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1048 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_30);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1050 = function(arg0, arg1, arg2) {
        const ret = makeClosure(arg0, arg1, 502, __wbg_adapter_35);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1052 = function(arg0, arg1, arg2) {
        const ret = makeClosure(arg0, arg1, 502, __wbg_adapter_35);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1054 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_30);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1056 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_30);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1058 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_30);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1060 = function(arg0, arg1, arg2) {
        const ret = makeClosure(arg0, arg1, 502, __wbg_adapter_35);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1062 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_30);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1064 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_30);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1066 = function(arg0, arg1, arg2) {
        const ret = makeClosure(arg0, arg1, 502, __wbg_adapter_35);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1068 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_30);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1070 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 502, __wbg_adapter_56);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper2607 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 920, __wbg_adapter_59);
        return addHeapObject(ret);
    };

    return imports;
}

function initMemory(imports, maybe_memory) {

}

function finalizeInit(instance, module) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    cachedFloat32Memory0 = null;
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint8Memory0 = null;

    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    const imports = getImports();

    initMemory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return finalizeInit(instance, module);
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('lib_tetris_slint_bg.wasm', import.meta.url);
    }
    const imports = getImports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    initMemory(imports);

    const { instance, module } = await load(await input, imports);

    return finalizeInit(instance, module);
}

export { initSync }
export default init;
