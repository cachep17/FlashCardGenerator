import streamlit as st
import os

# Read Google API key from Streamlit secrets
google_api_key = st.secrets["GOOGLE_API_KEY"]

import pandas as pd
import time
from utils import extract_text_from_pdf, extract_text_from_pptx
from flashcard_generator import generate_flashcards, Flashcard, get_sample_flashcards
from lang_manager import language_manager as lang_manager
from online_ai import online_generator

# Set page configuration
st.set_page_config(
    page_title=lang_manager.get_text("app_title"),
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for beautiful UI
st.markdown(
    """
<style>
    .main {
        padding-top: 2rem;
    }
    
    .stButton > button {
        width: 100%;
        border-radius: 20px;
        border: none;
        padding: 0.5rem 1rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .flashcard {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 2rem;
        margin: 1rem 0;
        min-height: 250px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: white;
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .flashcard:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(31, 38, 135, 0.5);
    }
    
    .flashcard-front {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .flashcard-back {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .flashcard-answer {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    
    .study-mode-card {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #333;
    }
    
    .nav-button {
        background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
        color: white;
        border: none;
        border-radius: 15px;
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        margin: 0.25rem;
    }
    
    .success-card {
        background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
        padding: 1rem;
        border-radius: 15px;
        margin: 1rem 0;
        text-align: center;
        color: #2d5a27;
        font-weight: 600;
    }
    
    .error-card {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        padding: 1rem;
        border-radius: 15px;
        margin: 1rem 0;
        text-align: center;
        color: #8b2635;
        font-weight: 600;
    }
    
    .sidebar .stSelectbox > div > div {
        border-radius: 15px;
    }
    
    .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 15px;
        color: white;
        text-align: center;
        margin: 0.5rem 0;
    }
</style>
""",
    unsafe_allow_html=True,
)

# Initialize session state variables
if "flashcards" not in st.session_state:
    st.session_state.flashcards = []
if "current_card_index" not in st.session_state:
    st.session_state.current_card_index = 0
if "card_flipped" not in st.session_state:
    st.session_state.card_flipped = False
if "sets" not in st.session_state:
    st.session_state.sets = {}
if "current_set" not in st.session_state:
    st.session_state.current_set = None
if "edit_mode" not in st.session_state:
    st.session_state.edit_mode = False
if "edit_card_index" not in st.session_state:
    st.session_state.edit_card_index = None
if "view_mode" not in st.session_state:
    st.session_state.view_mode = "input"  # 'input', 'view', 'sets'
if "api_key" not in st.session_state:
    st.session_state.api_key = None
if "use_sample_cards" not in st.session_state:
    st.session_state.use_sample_cards = False
if "ai_method" not in st.session_state:
    st.session_state.ai_method = "gemini"
if "language" not in st.session_state:
    st.session_state.language = "vi"
if "study_mode" not in st.session_state:
    st.session_state.study_mode = False
if "user_answer" not in st.session_state:
    st.session_state.user_answer = ""
if "show_answer" not in st.session_state:
    st.session_state.show_answer = False
if "answered_cards" not in st.session_state:
    st.session_state.answered_cards = []
if "correct_answers" not in st.session_state:
    st.session_state.correct_answers = 0

# Set current language
lang_manager.set_language(st.session_state.language)


def clear_flashcards():
    st.session_state.flashcards = []
    st.session_state.current_card_index = 0
    st.session_state.card_flipped = False
    st.session_state.edit_mode = False
    st.session_state.edit_card_index = None
    st.session_state.study_mode = False
    st.session_state.user_answer = ""
    st.session_state.show_answer = False
    st.session_state.answered_cards = []
    st.session_state.correct_answers = 0


def toggle_study_mode():
    st.session_state.study_mode = not st.session_state.study_mode
    st.session_state.user_answer = ""
    st.session_state.show_answer = False
    st.session_state.answered_cards = []
    st.session_state.correct_answers = 0


def submit_answer():
    st.session_state.show_answer = True
    if st.session_state.current_card_index not in st.session_state.answered_cards:
        st.session_state.answered_cards.append(st.session_state.current_card_index)


def mark_correct():
    if st.session_state.current_card_index not in st.session_state.answered_cards:
        st.session_state.correct_answers += 1
        st.session_state.answered_cards.append(st.session_state.current_card_index)
    next_card()


def mark_incorrect():
    if st.session_state.current_card_index not in st.session_state.answered_cards:
        st.session_state.answered_cards.append(st.session_state.current_card_index)
    next_card()


def next_card():
    if st.session_state.flashcards:
        st.session_state.current_card_index = (
            st.session_state.current_card_index + 1
        ) % len(st.session_state.flashcards)
        st.session_state.card_flipped = False
        st.session_state.user_answer = ""
        st.session_state.show_answer = False


def prev_card():
    if st.session_state.flashcards:
        st.session_state.current_card_index = (
            st.session_state.current_card_index - 1
        ) % len(st.session_state.flashcards)
        st.session_state.card_flipped = False
        st.session_state.user_answer = ""
        st.session_state.show_answer = False


def flip_card():
    st.session_state.card_flipped = not st.session_state.card_flipped


def save_set(set_name):
    if not set_name:
        st.error(lang_manager.get_text("set_save_error_name"))
        return

    if set_name in st.session_state.sets:
        st.error(lang_manager.get_text("set_save_error_exists", name=set_name))
        return

    if not st.session_state.flashcards:
        st.error(lang_manager.get_text("set_save_error_empty"))
        return

    st.session_state.sets[set_name] = st.session_state.flashcards.copy()
    st.session_state.current_set = set_name
    st.success(
        lang_manager.get_text(
            "set_save_success", count=len(st.session_state.flashcards), name=set_name
        )
    )
    st.session_state.view_mode = "sets"
    st.rerun()


def load_set(set_name):
    if set_name in st.session_state.sets:
        st.session_state.flashcards = st.session_state.sets[set_name].copy()
        st.session_state.current_card_index = 0
        st.session_state.card_flipped = False
        st.session_state.current_set = set_name
        st.session_state.view_mode = "view"
        st.rerun()
    else:
        st.error(lang_manager.get_text("set_not_found", name=set_name))


def delete_set(set_name):
    if set_name in st.session_state.sets:
        del st.session_state.sets[set_name]
        st.success(lang_manager.get_text("set_delete_success", name=set_name))
        if st.session_state.current_set == set_name:
            st.session_state.current_set = None
            st.session_state.flashcards = []
            st.session_state.current_card_index = 0
        st.rerun()
    else:
        st.error(lang_manager.get_text("set_not_found", name=set_name))


def delete_card(index):
    if 0 <= index < len(st.session_state.flashcards):
        st.session_state.flashcards.pop(index)
        if st.session_state.current_card_index >= len(st.session_state.flashcards):
            st.session_state.current_card_index = max(
                0, len(st.session_state.flashcards) - 1
            )
        st.rerun()


def enter_edit_mode(index):
    st.session_state.edit_mode = True
    st.session_state.edit_card_index = index
    st.rerun()


def save_edit(front, back):
    if (
        st.session_state.edit_card_index is not None
        and 0 <= st.session_state.edit_card_index < len(st.session_state.flashcards)
    ):
        st.session_state.flashcards[st.session_state.edit_card_index] = Flashcard(
            front, back
        )
        st.session_state.edit_mode = False
        st.session_state.edit_card_index = None
        st.rerun()


# Application header
st.markdown(
    f"""
<div style="text-align: center; padding: 2rem 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; margin-bottom: 2rem; color: white;">
    <h1 style="font-size: 3rem; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
        {lang_manager.get_text("app_title")}
    </h1>
    <p style="font-size: 1.2rem; margin: 0.5rem 0; opacity: 0.9;">
        {lang_manager.get_text("app_subtitle")}
    </p>
</div>
""",
    unsafe_allow_html=True,
)

# API Key input (sidebar)
with st.sidebar:
    st.header(lang_manager.get_text("settings"))

    # Language selection
    available_languages = lang_manager.get_available_languages()
    language_options = list(available_languages.keys())
    language_labels = list(available_languages.values())

    current_lang_index = (
        language_options.index(st.session_state.language)
        if st.session_state.language in language_options
        else 0
    )

    selected_language = st.selectbox(
        lang_manager.get_text("language"),
        options=language_options,
        format_func=lambda x: available_languages[x],
        index=current_lang_index,
        key="language_selector",
    )

    if selected_language != st.session_state.language:
        st.session_state.language = selected_language
        lang_manager.set_language(selected_language)
        st.rerun()

    st.markdown("---")  # AI Method selection
    ai_method_options = ["gemini"]

    # Get AI methods text safely
    ai_methods_dict = lang_manager.get_text("ai_methods")
    ai_method_help_dict = lang_manager.get_text("ai_method_help")

    current_method_index = (
        ai_method_options.index(st.session_state.ai_method)
        if st.session_state.ai_method in ai_method_options
        else 0
    )

    ai_method = "gemini"

    # Remove API Key input for Gemini
    # if ai_method == "gemini":
    #     api_key_input = st.text_input(
    #         lang_manager.get_text("api_key_label"),
    #         type="password",
    #         help=lang_manager.get_text("api_key_help"),
    #         value=st.session_state.api_key if st.session_state.api_key else "",
    #     )
    #
    #     if api_key_input != st.session_state.api_key:
    #         st.session_state.api_key = api_key_input if api_key_input.strip() else None

    # st.session_state.use_sample_cards = st.checkbox(
    #     lang_manager.get_text("use_sample_cards"),
    #     value=st.session_state.use_sample_cards,
    #     help=lang_manager.get_text("use_sample_cards_help"),
    # )

    # st.markdown("---")
    # if ai_method == "gemini":
    #     st.markdown(
    #         f"""
    #     ### {lang_manager.get_text("gemini_api_guide", default="Cách Lấy API Key Gemini (Miễn Phí)")}
    #     1. {lang_manager.get_text("visit_studio", default="Truy cập")} [Google AI Studio](https://makersuite.google.com/app/apikey)
    #     2. {lang_manager.get_text("login_google", default="Đăng nhập bằng tài khoản Google")}
    #     3. {lang_manager.get_text("create_api_key", default="Tạo API key")}
    #     4. {lang_manager.get_text("copy_paste", default="Sao chép và dán vào đây")}
    #     """
    #     )

# Navigation
st.markdown("### 🧭 " + lang_manager.get_text("navigation"))
nav_col1, nav_col2, nav_col3, nav_col4 = st.columns(4)
with nav_col1:
    if st.button("📝 " + lang_manager.get_text("create_flashcards"), key="nav_create"):
        st.session_state.view_mode = "input"
        st.rerun()
with nav_col2:
    if st.button("👀 " + lang_manager.get_text("view_flashcards"), key="nav_view"):
        if st.session_state.flashcards:
            st.session_state.view_mode = "view"
            st.rerun()
        else:
            st.error("❌ " + lang_manager.get_text("no_flashcards_available"))
with nav_col3:
    if st.button("💾 " + lang_manager.get_text("saved_sets"), key="nav_sets"):
        st.session_state.view_mode = "sets"
        st.rerun()
with nav_col4:
    if st.session_state.flashcards:
        study_btn_text = (
            "🔴 " + lang_manager.get_text("exit_study")
            if st.session_state.study_mode
            else "🎯 " + lang_manager.get_text("study_mode")
        )
        if st.button(study_btn_text, key="nav_study"):
            toggle_study_mode()
            st.rerun()

st.markdown("---")

# Main content based on view mode
if st.session_state.view_mode == "input":
    st.markdown("### 📝 " + lang_manager.get_text("create_new_flashcards"))

    # Input method selection with beautiful radio buttons
    st.markdown("#### 🔧 " + lang_manager.get_text("choose_input_method"))
    input_method = st.radio(
        lang_manager.get_text("select_input_method"),
        [
            "📁 " + lang_manager.get_text("upload_method"),
            "✍️ " + lang_manager.get_text("text_method"),
        ],
        horizontal=True,
    )

    content_text = ""

    if "📁" in input_method:  # Upload method
        st.markdown("#### 📁 Upload Your Files")
        uploaded_file = st.file_uploader(
            "🔺 " + lang_manager.get_text("upload_files"),
            type=["pdf", "pptx"],
            help="Drag and drop your PDF or PowerPoint files here",
        )

        if uploaded_file is not None:
            file_extension = os.path.splitext(uploaded_file.name)[1].lower()

            try:
                with st.spinner("🔄 Extracting content..."):
                    if file_extension == ".pdf":
                        content_text = extract_text_from_pdf(uploaded_file)
                    elif file_extension == ".pptx":
                        content_text = extract_text_from_pptx(uploaded_file)

                st.markdown(
                    f"""
                <div class="success-card">
                    ✅ Successfully extracted content from {uploaded_file.name}
                </div>
                """,
                    unsafe_allow_html=True,
                )

                st.markdown("#### ✏️ Extracted Content (Editable)")
                content_text = st.text_area(
                    "📝 You can edit the extracted content below:",
                    content_text,
                    height=250,
                    help="Review and edit the extracted content if needed",
                )
            except Exception as e:
                st.markdown(
                    f"""
                <div class="error-card">
                    ❌ Error extracting content: {str(e)}
                </div>
                """,
                    unsafe_allow_html=True,
                )

    else:  # Text input method
        st.markdown("#### ✍️ Enter Your Content")
        content_text = st.text_area(
            "📝 " + lang_manager.get_text("enter_text"),
            height=250,
            placeholder="Paste or type your study content here...",
            help="Enter the text you want to convert into flashcards",
        )

    # Subject and number of cards selection
    st.markdown("#### ⚙️ Flashcard Settings")
    col1, col2 = st.columns(2)
    with col1:
        subject = st.text_input(
            "🎯 " + lang_manager.get_text("subject_topic"),
            placeholder="e.g., Biology, History, Math...",
            help="Enter the subject or topic for your flashcards",
        )
    with col2:
        num_cards = st.slider(
            "🔢 " + lang_manager.get_text("num_cards"),
            min_value=3,
            max_value=20,
            value=10,
            help="Choose how many flashcards to generate",
        )

    # Generate button with beautiful styling
    st.markdown("#### 🚀 Generate Your Flashcards")
    if st.button("🎯 " + lang_manager.get_text("generate_btn"), key="generate_btn"):
        if not content_text.strip():
            st.markdown(
                """
            <div class="error-card">
                ❌ Please provide content to generate flashcards
            </div>
            """,
                unsafe_allow_html=True,
            )
        else:
            with st.spinner("🧠 " + lang_manager.get_text("generating_gemini")):
                try:
                    clear_flashcards()
                    # Use online_generator with Gemini API key
                    api_key = google_api_key
                    st.session_state.flashcards = online_generator.generate_flashcards(
                        content_text,
                        subject,
                        num_cards,
                        st.session_state.language,
                        api_key,
                    )

                    if st.session_state.flashcards:
                        st.markdown(
                            f"""
                        <div class="success-card">
                            ✅ Successfully created {len(st.session_state.flashcards)} flashcards!
                        </div>
                        """,
                            unsafe_allow_html=True,
                        )

                        st.balloons()
                        st.session_state.view_mode = "view"
                        st.rerun()
                    else:
                        st.markdown(
                            """
                        <div class="error-card">
                            ❌ Failed to generate flashcards. Please try again.
                        </div>
                        """,
                            unsafe_allow_html=True,
                        )
                except Exception as e:
                    st.markdown(
                        f"""
                    <div class="error-card">
                        ❌ Error generating flashcards: {str(e)}
                    </div>
                    """,
                        unsafe_allow_html=True,
                    )
                    # Try fallback methods
                    if st.session_state.use_sample_cards:
                        st.warning(
                            "🔄 " + lang_manager.get_text("using_sample_fallback")
                        )
                        st.session_state.flashcards = get_sample_flashcards(subject)[
                            :num_cards
                        ]
                        st.session_state.view_mode = "view"
                        st.rerun()

elif st.session_state.view_mode == "view":
    if not st.session_state.flashcards:
        st.warning("⚠️ " + lang_manager.get_text("no_flashcards_to_display"))
        st.session_state.view_mode = "input"
        st.rerun()

    # Header with statistics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(
            f"""
        <div class="stat-card">
            <h3>📊 {lang_manager.get_text("total_cards")}</h3>
            <h2>{len(st.session_state.flashcards)}</h2>
        </div>
        """,
            unsafe_allow_html=True,
        )
    with col2:
        if st.session_state.study_mode:
            progress = (
                len(st.session_state.answered_cards)
                / len(st.session_state.flashcards)
                * 100
            )
            st.markdown(
                f"""
            <div class="stat-card">
                <h3>📈 {lang_manager.get_text("progress")}</h3>
                <h2>{progress:.0f}%</h2>
            </div>
            """,
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                f"""
            <div class="stat-card">
                <h3>👆 {lang_manager.get_text("current_card")}</h3>
                <h2>{st.session_state.current_card_index + 1}</h2>
            </div>
            """,
                unsafe_allow_html=True,
            )
    with col3:
        if st.session_state.study_mode and st.session_state.answered_cards:
            accuracy = (
                st.session_state.correct_answers
                / len(st.session_state.answered_cards)
                * 100
            )
            st.markdown(
                f"""
            <div class="stat-card">
                <h3>🎯 {lang_manager.get_text("accuracy")}</h3>
                <h2>{accuracy:.0f}%</h2>
            </div>
            """,
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                f"""
            <div class="stat-card">
                <h3>💾 Mode</h3>
                <h2>{"Study" if st.session_state.study_mode else "Review"}</h2>
            </div>
            """,
                unsafe_allow_html=True,
            )

    # Save set controls
    if not st.session_state.study_mode:
        st.markdown("### 💾 Save Flashcard Set")
        save_col1, save_col2, save_col3 = st.columns([2, 1, 1])
        with save_col1:
            set_name = st.text_input(
                "🏷️ " + lang_manager.get_text("set_name_label"), key="set_name_input"
            )
        with save_col2:
            if st.button(
                "💾 " + lang_manager.get_text("save_set_btn"), key="save_set_btn"
            ):
                save_set(set_name)
        with save_col3:
            if st.session_state.current_set:
                st.info(f"📂 Current: {st.session_state.current_set}")

    # Display the current flashcard
    if st.session_state.flashcards:
        current_card = st.session_state.flashcards[st.session_state.current_card_index]

        # Edit mode
        if (
            st.session_state.edit_mode
            and st.session_state.edit_card_index == st.session_state.current_card_index
            and not st.session_state.study_mode
        ):
            st.markdown("### ✏️ Edit Flashcard")
            edit_front = st.text_area(
                "🔍 " + lang_manager.get_text("front_side_label"),
                current_card.front,
                height=150,
            )
            edit_back = st.text_area(
                "💡 " + lang_manager.get_text("back_side_label"),
                current_card.back,
                height=150,
            )

            col1, col2 = st.columns(2)
            with col1:
                if st.button("✅ " + lang_manager.get_text("save_changes_btn")):
                    save_edit(edit_front, edit_back)
            with col2:
                if st.button("❌ " + lang_manager.get_text("cancel_btn")):
                    st.session_state.edit_mode = False
                    st.session_state.edit_card_index = None
                    st.rerun()

        # Study Mode
        elif st.session_state.study_mode:
            st.markdown("### 🎯 " + lang_manager.get_text("study_mode_title"))

            # Question card
            question_class = "flashcard study-mode-card"
            st.markdown(
                f"""
            <div class="{question_class}">
                <h2>❓ {lang_manager.get_text("question_label")}</h2>
                <h3>{current_card.front}</h3>
            </div>
            """,
                unsafe_allow_html=True,
            )

            # Answer input
            if not st.session_state.show_answer:
                st.session_state.user_answer = st.text_area(
                    "🤔 " + lang_manager.get_text("your_answer"),
                    value=st.session_state.user_answer,
                    height=100,
                    placeholder=lang_manager.get_text("answer_placeholder"),
                )

                if st.button(
                    "🔍 " + lang_manager.get_text("show_answer"), key="show_answer_btn"
                ):
                    submit_answer()
                    st.rerun()
            else:
                # Show user's answer
                if st.session_state.user_answer:
                    st.markdown(
                        f"""
                    <div class="flashcard-answer">
                        <h3>✍️ {lang_manager.get_text("your_answer")}</h3>
                        <p>{st.session_state.user_answer}</p>
                    </div>
                    """,
                        unsafe_allow_html=True,
                    )

                # Show correct answer
                st.markdown(
                    f"""
                <div class="flashcard flashcard-back">
                    <div>
                        <h2>✅ {lang_manager.get_text("correct_answer")}</h2>
                        <h3>{current_card.back}</h3>
                    </div>
                </div>
                """,
                    unsafe_allow_html=True,
                )

                # Self-assessment buttons
                st.markdown("### 🤷 " + lang_manager.get_text("how_did_you_do"))
                col1, col2 = st.columns(2)
                with col1:
                    if st.button(
                        "✅ " + lang_manager.get_text("correct"), key="correct_btn"
                    ):
                        mark_correct()
                        st.rerun()
                with col2:
                    if st.button(
                        "❌ " + lang_manager.get_text("need_practice"),
                        key="incorrect_btn",
                    ):
                        mark_incorrect()
                        st.rerun()

        # Regular View Mode
        else:
            # Card display
            card_class = (
                "flashcard-back" if st.session_state.card_flipped else "flashcard-front"
            )
            content = (
                current_card.back
                if st.session_state.card_flipped
                else current_card.front
            )

            st.markdown(
                f"""
            <div class="flashcard {card_class}">
                <h2>{content}</h2>
            </div>
            """,
                unsafe_allow_html=True,
            )

            # Flip button
            flip_text = (
                "🔄 Show Question"
                if st.session_state.card_flipped
                else "🔄 Show Answer"
            )
            if st.button(flip_text, key="flip_btn"):
                flip_card()
                st.rerun()

        # Navigation controls
        if not st.session_state.edit_mode:
            st.markdown("### 🧭 " + lang_manager.get_text("navigation"))
            nav_cols = st.columns([1, 1, 1, 1, 1])
            with nav_cols[0]:
                if st.button("⬅️ " + lang_manager.get_text("prev_btn"), key="prev_btn"):
                    prev_card()
                    st.rerun()
            with nav_cols[1]:
                if st.button("➡️ " + lang_manager.get_text("next_btn"), key="next_btn"):
                    next_card()
                    st.rerun()

            if not st.session_state.study_mode:
                with nav_cols[3]:
                    if st.button(
                        "✏️ " + lang_manager.get_text("edit_btn"), key="edit_btn"
                    ):
                        enter_edit_mode(st.session_state.current_card_index)
                with nav_cols[4]:
                    if st.button(
                        "🗑️ " + lang_manager.get_text("delete_btn"), key="delete_btn"
                    ):
                        delete_card(st.session_state.current_card_index)

            # Card counter
            if st.session_state.study_mode:
                answered_count = len(st.session_state.answered_cards)
                total_count = len(st.session_state.flashcards)
                st.progress(answered_count / total_count)
                st.markdown(
                    f"**📊 Progress: {answered_count}/{total_count} cards completed**"
                )
            else:
                st.markdown(
                    f"**📍 {lang_manager.get_text('card_counter', current=st.session_state.current_card_index + 1, total=len(st.session_state.flashcards))}**"
                )

elif st.session_state.view_mode == "sets":
    st.markdown("### 💾 Saved Flashcard Sets")

    if not st.session_state.sets:
        st.markdown(
            """
        <div style="text-align: center; padding: 3rem; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 20px; margin: 2rem 0;">
            <h2>📂 No Saved Sets Yet</h2>
            <p>Create and save some flashcards first to see them here!</p>
        </div>
        """,
            unsafe_allow_html=True,
        )
    else:
        # Display statistics
        total_cards = sum(len(cards) for cards in st.session_state.sets.values())
        st.markdown(
            f"""
        <div class="stat-card">
            <h3>📊 Library Statistics</h3>
            <p><strong>{len(st.session_state.sets)}</strong> sets • <strong>{total_cards}</strong> total cards</p>
        </div>
        """,
            unsafe_allow_html=True,
        )

        # Display sets in a beautiful grid
        st.markdown("#### 📚 Your Flashcard Sets")

        for i, (set_name, cards) in enumerate(st.session_state.sets.items()):
            with st.container():
                col1, col2, col3, col4 = st.columns([3, 1, 1, 1])

                with col1:
                    st.markdown(
                        f"""
                    <div style="padding: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                color: white; border-radius: 15px; margin: 0.5rem 0;">
                        <h4>📂 {set_name}</h4>
                        <p>🃏 {len(cards)} cards</p>
                    </div>
                    """,
                        unsafe_allow_html=True,
                    )

                with col2:
                    if st.button("👀 View", key=f"view_{i}"):
                        load_set(set_name)

                with col3:
                    if st.button("🎯 Study", key=f"study_{i}"):
                        load_set(set_name)
                        st.session_state.study_mode = True
                        st.rerun()

                with col4:
                    if st.button("🗑️ Delete", key=f"delete_{i}"):
                        delete_set(set_name)

        # Quick load section
        st.markdown("#### ⚡ Quick Load")
        col1, col2 = st.columns([2, 1])
        with col1:
            selected_set = st.selectbox(
                "📂 " + lang_manager.get_text("select_set_label"),
                list(st.session_state.sets.keys()),
                help="Choose a set to load quickly",
            )
        with col2:
            if st.button(
                "🚀 " + lang_manager.get_text("load_set_btn"), key="quick_load"
            ):
                load_set(selected_set)
