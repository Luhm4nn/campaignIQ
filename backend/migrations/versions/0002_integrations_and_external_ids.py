"""Add integrations table and external_id indexes to campaigns and posts

Revision ID: 0002_integrations_and_external_ids
Revises: 0001_initial
Create Date: 2026-10-27 15:05:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002_integrations_and_external_ids"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "integrations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(), nullable=False, server_default=""),
        sa.Column("client_id_encrypted", sa.String(), nullable=False, server_default=""),
        sa.Column("client_id_hash", sa.String(), nullable=False, server_default=""),
        sa.Column("client_secret_encrypted", sa.String(), nullable=False, server_default=""),
        sa.Column("access_token_encrypted", sa.String(), nullable=False, server_default=""),
        sa.Column("external_account_id", sa.String(), nullable=False, server_default=""),
        sa.Column("external_account_name", sa.String(), nullable=False, server_default=""),
        sa.Column("status", sa.String(), nullable=False, server_default="disconnected"),
        sa.Column("oauth_state", sa.String(), nullable=True),
        sa.Column("last_sync_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_integrations_id"), "integrations", ["id"], unique=False)
    op.create_index(op.f("ix_integrations_provider"), "integrations", ["provider"], unique=True)
    op.create_index(op.f("ix_integrations_client_id_hash"), "integrations", ["client_id_hash"], unique=False)
    op.create_index(op.f("ix_integrations_external_account_id"), "integrations", ["external_account_id"], unique=False)
    op.create_index(op.f("ix_integrations_oauth_state"), "integrations", ["oauth_state"], unique=False)

    op.add_column("campaigns", sa.Column("external_id", sa.String(), nullable=True))
    op.create_index(op.f("ix_campaigns_external_id"), "campaigns", ["external_id"], unique=False)

    op.add_column("posts", sa.Column("external_id", sa.String(), nullable=True))
    op.add_column("posts", sa.Column("permalink", sa.String(), nullable=True))
    op.create_index(op.f("ix_posts_external_id"), "posts", ["external_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_posts_external_id"), table_name="posts")
    op.drop_column("posts", "permalink")
    op.drop_column("posts", "external_id")

    op.drop_index(op.f("ix_campaigns_external_id"), table_name="campaigns")
    op.drop_column("campaigns", "external_id")

    op.drop_index(op.f("ix_integrations_oauth_state"), table_name="integrations")
    op.drop_index(op.f("ix_integrations_external_account_id"), table_name="integrations")
    op.drop_index(op.f("ix_integrations_client_id_hash"), table_name="integrations")
    op.drop_index(op.f("ix_integrations_provider"), table_name="integrations")
    op.drop_index(op.f("ix_integrations_id"), table_name="integrations")
    op.drop_table("integrations")
