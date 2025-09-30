import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedtype , username, userId}) => {
	const getPostEndPoint = () => {
		switch (feedtype) {
			case "forYou":
				return "/api/post/all"
			case "following":
				return "/api/post/following"
			case "posts":
				return `/api/post/user/${username}`
			case "likes":
				return `/api/post/likes/${userId}`
			default:
				return "/api/post/all"
		}
	}
	const POST_ENDPOINT=getPostEndPoint()
	const {data:POSTS, isLoading, refetch, isRefetching}=useQuery({
		queryKey: ["posts"],
		queryFn: async()=>{
			try {
				const res= await fetch(POST_ENDPOINT);
				const dataEle = await res.json();
				if(!res.ok) throw new Error(dataEle.error || "something went wrong")
				
				return dataEle;
			} catch (error) {
				throw error
			}
		}
	})
	useEffect(()=>{refetch()},[feedtype, refetch])
	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && POSTS?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && POSTS && (
				<div>
					{POSTS.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;