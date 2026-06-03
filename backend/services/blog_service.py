import asyncio

from starlette.requests import Request

from ai.main import generate_blog


class GenerationCancelledError(Exception):
    """Raised when the client disconnects or aborts before generation finishes."""


async def _wait_client_disconnect(http_request: Request) -> None:
    while True:
        if await http_request.is_disconnected():
            return
        await asyncio.sleep(0.2)


async def generate_blog_service(topic: str):
    return await generate_blog(topic)


async def generate_blog_service_cancellable(http_request: Request, topic: str):
    """
    Run blog generation but cancel the graph task when the HTTP client disconnects
    (e.g. user clicks Stop). Sync LLM calls inside a node may still run to completion
    for that single step; cancellation applies between LangGraph steps.
    """
    gen_task = asyncio.create_task(generate_blog_service(topic))
    disconnect_task = asyncio.create_task(_wait_client_disconnect(http_request))
    try:
        done, _pending = await asyncio.wait(
            {gen_task, disconnect_task},
            return_when=asyncio.FIRST_COMPLETED,
        )
        if disconnect_task in done:
            if not gen_task.done():
                gen_task.cancel()
                try:
                    await gen_task
                except asyncio.CancelledError:
                    pass
                raise GenerationCancelledError()
            return await gen_task
        disconnect_task.cancel()
        try:
            await disconnect_task
        except asyncio.CancelledError:
            pass
        return await gen_task
    finally:
        if not disconnect_task.done():
            disconnect_task.cancel()
            try:
                await disconnect_task
            except asyncio.CancelledError:
                pass