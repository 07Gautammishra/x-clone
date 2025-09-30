import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from 'cloudinary'

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        if (!text && !img) return res.status(400).json({ error: "Post most have text or img" });

        if (img) {
            const uploaderImg = await cloudinary.uploader.upload(img)
            img = uploaderImg.secure_url;
        }
        const newPost = new Post({
            user: userId,
            text,
            img,
        })
        await newPost.save()
        res.status(200).json(newPost)
    } catch (error) {
        console.error(`Error on createPost: ${error.message}`)
        res.status(500).json({ error: "internal server Error" })
    }
}
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) return res.status(404).json({ error: "Post not found" });

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(400).json({ error: "You are not authorized to delete this post" })
        }
        if (post.img) {
            const imgId = post.img.split("/").pop().slice(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post delete successfully" })
    } catch (error) {
        console.error(`Error on deletePost: ${error.message}`)
        res.status(500).json({ error: "internal server Error" })
    }
}
export const likeOrUnlikePost = async (req, res) => {
    try {
      const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
    } catch (error) {
        console.error(`Error on like or unlike: ${error}`)
        res.status(500).json({ error: "internal server Error" })
    }
}
export const commentOnPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { text } = req.body;

        const userId = req.user.id;
        if (!text) return res.status(400).json({ error: "Text feild is required" });

        const post = await Post.findById(postId)
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = { user: userId, text }
        post.comments.push(comment)
        await post.save()
        res.status(200).json(post)
    } catch (error) {
        console.error(`Error on comment on post: ${error.message}`)
        res.status(500).json({ error: "internal server Error" })
    }
}

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({ path: "user", select: "-password" }).populate({ path: "comments.user", select: "-password" })
        if (posts.length === 0) return res.status(200).json([]);
        res.status(200).json(posts)
    } catch (error) {
        console.error(`Error on getAllPost: ${error.message}`)
        res.status(500).json({ error: "internal server Error" })
    }
}

export const getlikesPost=async(req, res)=>{
    try {
        const userId= req.params.id;
        const user= await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        const likedpost = await Post.find({_id: {$in: user.likedPosts}}).populate({path: "user", select: "-password"}).populate({path: "comments.user", select:"-password"})
        res.status(200).json(likedpost)
    } catch (error) {
        
        console.error(`Error on getlikesPost: ${error.message}`)
        res.status(500).json({ error: "internal server Error" })
    }
}

export const getFollowingPosts= async(req, res)=>{
    try {
        const userId= req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        const following = user.following;
        const feedPost =await Post.find({user: {$in: following}}).sort({createdAt: -1}).populate({path: "user", select:"-password"}).populate({path: "comments.user", select: "-password"});
        
        res.status(200).json(feedPost)
    } catch (error) {
        console.error(`Error on getFollowingPosts: ${error.message}`)
        res.status(500).json({ error: "internal server Error" })
        
    }
}

export const getUserPosts=async(req, res)=>{
    try {
        const {username}= req.params;
        const user = await User.findOne({username})
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        const feedPost =await Post.find({user: user._id}).sort({createdAt: -1}).populate({path: "user", select:"-password"}).populate({path: "comments.user", select: "-password"});
        res.status(200).json(feedPost)

    } catch (error) {
        
        console.error(`Error on getUserPost: ${error.message}`)
        res.status(500).json({ error: "internal server Error" })
    }
}