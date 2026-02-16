
import asyncio
import traceback
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

async def main():
    try:
        from orchestration.features import FeatureRegistry
        print("Running generate_ci_and_docker...")
        result = await FeatureRegistry.run_feature('generate_ci_and_docker')
        print(result)
    except Exception:
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
