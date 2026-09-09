from datetime import datetime, timezone
from typing import Annotated

from pydantic import PlainSerializer


def utcnow() -> datetime:
    """Naive UTC timestamp, matching the timezone-less DateTime columns."""

    return datetime.now(timezone.utc).replace(tzinfo=None)


def as_utc_iso(value: datetime) -> str:
    """Render a stored timestamp as an explicit UTC instant.

    The DateTime columns are timezone-less and hold UTC (see utcnow), so a plain
    isoformat() emits "2026-10-04T12:00:00". ECMAScript parses a zone-less
    date-time as *local* time, which silently shifts every timestamp by the
    reader's UTC offset - and for a token expiry that is a correctness bug, not
    a cosmetic one. Marking the zone puts every client on the same instant.
    """

    aware = value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value
    return aware.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


# Response-schema annotation: naive UTC in the database, explicit UTC on the wire.
# Serialization only - request fields stay plain datetime, so inbound values are
# still normalized to naive UTC by their validators.
UTCDatetime = Annotated[
    datetime,
    PlainSerializer(as_utc_iso, return_type=str, when_used="json"),
]
