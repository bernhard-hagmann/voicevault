"""Add user activation and personal access tokens.

Revision ID: b4d8e2f6a1c3
Revises: c7e1a9b4d2f3
Create Date: 2026-09-04
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "b4d8e2f6a1c3"
down_revision = "c7e1a9b4d2f3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_table(
        "personal_access_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("token_prefix", sa.String(24), nullable=False),
        sa.Column("permissions", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("last_used_at", sa.DateTime(), nullable=True),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
    )
    op.create_index(
        "ix_personal_access_tokens_token_hash",
        "personal_access_tokens",
        ["token_hash"],
        unique=True,
    )
    # Admin listing sorts by created_at; the per-user listing filters on user_id
    # and sorts by created_at. The composite index also serves plain user_id
    # lookups, so there is no separate user_id index.
    op.create_index(
        "ix_personal_access_tokens_created_at",
        "personal_access_tokens",
        ["created_at"],
    )
    op.create_index(
        "ix_personal_access_tokens_user_created_at",
        "personal_access_tokens",
        ["user_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_personal_access_tokens_user_created_at",
        table_name="personal_access_tokens",
    )
    op.drop_index(
        "ix_personal_access_tokens_created_at",
        table_name="personal_access_tokens",
    )
    op.drop_index(
        "ix_personal_access_tokens_token_hash",
        table_name="personal_access_tokens",
    )
    op.drop_table("personal_access_tokens")
    op.drop_column("users", "is_active")
