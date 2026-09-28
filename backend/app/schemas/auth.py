from pydantic import BaseModel, ConfigDict


class UserRegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    email: str
    password: str


class UserLoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class SafeUserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: str | None = None
