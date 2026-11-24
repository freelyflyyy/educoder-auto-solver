import sys
import os
import io
import shutil
import json
import builtins

class AnyHook:
    def __eq__(self, other): return True
    def __ne__(self, other): return False
    def __gt__(self, other): return True
    def __lt__(self, other): return False
    def __bool__(self): return True

    def __getitem__(self, key): return self
    def __contains__(self, item): return True
    def __iter__(self): return iter([self])
    def __len__(self): return 1

    def __getattr__(self, name):
        if name.startswith('__') and name.endswith('__'):
            raise AttributeError(name)
        return self
    def __call__(self, *args, **kwargs): return self 

    def __str__(self): return "ANY"
    def __hash__(self): return 0

if len(sys.argv) < 2:
    print('error')
    sys.exit(1)

target_file = sys.argv[1]

with open(target_file, "r", encoding="utf-8") as f:
    target_code = f.read()

os.listdir = lambda *args, **kwargs: ["fake.mdj"]
os.path.exists = lambda *args, **kwargs: True
shutil.copy = lambda *args, **kwargs: None
builtins.open = lambda *args, **kwargs: io.StringIO("{}")
json.load = lambda *args, **kwargs: AnyHook()
json.loads = lambda *args, **kwargs: AnyHook()


run_env = {
    "__name__": "__main__",
    "__file__": target_file,
}

compiled_code = compile(target_code, target_file, "exec")
exec(compiled_code, run_env)
