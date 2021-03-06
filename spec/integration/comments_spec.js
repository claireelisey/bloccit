const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Comment = require("../../src/db/models").Comment;

describe("routes : comments", () => {

    // Define a context for guest user.
    beforeEach((done) => {

        this.user;
        this.topic;
        this.post;
        this.comment;
    
        sequelize.sync({force: true}).then((res) => {
    
            User.create({
            email: "starman@tesla.com",
            password: "Trekkie4lyfe"
            })
            .then((user) => {
                this.user = user;  // store user
    
                Topic.create({
                    title: "Expeditions to Alpha Centauri",
                    description: "A compilation of reports from recent visits to the star system.",
                    posts: [{   
                        title: "My first visit to Proxima Centauri b",
                        body: "I saw some rocks.",
                        userId: this.user.id   
                    }]
                }, {
                    include: {                        //nested creation of posts
                        model: Post,
                        as: "posts"
                    }
                })
                .then((topic) => {
                    this.topic = topic;                 // store topic
                    this.post = this.topic.posts[0];  // store post
    
                    Comment.create({  
                        body: "ay caramba!!!!!",
                        userId: this.user.id,          
                        postId: this.post.id
                    })
                    .then((coment) => {
                        this.comment = coment;             // store comment
                        
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        
                        done();
                    });
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    //test suites will go here


    // START GUEST USER CONTEXT
    // Ensure there is no user signed in.
    describe("guest attempting to perform CRUD actions for Comment", () => {

        beforeEach((done) => {    // before each suite in this context
            request.get({           // mock authentication
                url: "http://localhost:3000/auth/fake",
                form: {
                userId: 0 // flag to indicate mock auth to destroy any session
                }
            },
                (err, res, body) => {
                    
                    done();
                }
            );
        });

        // Ensure a user who is not signed in is not able to create a comment.
        describe("POST /topics/:topicId/posts/:postId/comments/create", () => {

            it("should not create a new comment", (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
                    form: {
                        body: "This comment is amazing!"
                    }
                };
                request.post(options, (err, res, body) => {
                    Comment.findOne({where: {body: "This comment is amazing!"}})
                    .then((comment) => {
                        expect(comment).toBeNull();   // ensure no comment was created
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });

        // Ensure a user who is not signed in is not able to destroy a comment.
        describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {

            it("should not delete the comment with the associated ID", (done) => {
                Comment.all()
                .then((comments) => {
                    const commentCountBeforeDelete = comments.length;

                    expect(commentCountBeforeDelete).toBe(1);

                    request.post(
                    `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                    (err, res, body) => {
                    Comment.all()
                    .then((comments) => {
                        expect(err).toBeNull();
                        expect(comments.length).toBe(commentCountBeforeDelete);
                        
                        done();
                    })

                    });
                })
            });   
        });

    });
    // END GUEST USER CONTEXT


    // START SIGNED-IN (MEMBER) USER CONTEXT
    describe("signed in user performing CRUD actions for Comment", () => {

        // Define a context for a signed in user.
        beforeEach((done) => {    // before each suite in this context
            request.get({           // mock authentication
                url: "http://localhost:3000/auth/fake",
                form: {
                    role: "member",     // mock authenticate as member user
                    userId: this.user.id
                }
            },
                (err, res, body) => {
                    
                    done();
                }
            );
        });

        // Ensure a user who is signed in is able to create a comment.
        describe("POST /topics/:topicId/posts/:postId/comments/create", () => {

            it("should create a new comment and redirect", (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
                    form: {
                        body: "This comment is amazing!"
                    }
                };
                request.post(options,
                (err, res, body) => {
                    Comment.findOne({where: {body: "This comment is amazing!"}})
                    .then((comment) => {
                        expect(comment).not.toBeNull();
                        expect(comment.body).toBe("This comment is amazing!");
                        expect(comment.id).not.toBeNull();
                        
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        
                        done();
                    });
                }
                );
            });
        });

        // Ensure a user who is signed in is able to destroy a comment.
        describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {

            it("should delete the comment with the associated ID", (done) => {
                Comment.all()
                .then((comments) => {
                    const commentCountBeforeDelete = comments.length;
        
                    expect(commentCountBeforeDelete).toBe(1);
        
                    request.post(
                        `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                        (err, res, body) => {
                            expect(res.statusCode).toBe(302);
                            Comment.all()
                            .then((comments) => {
                                expect(err).toBeNull();
                                expect(comments.length).toBe(commentCountBeforeDelete - 1);
                                
                                done();
                            })

                    });
                })
     
            });

            // Ensure a member is not able to destroy another member's comment.
            it("should not delete another members comment", (done) => {
                User.create({
                    email: "david@davidbowie.com",
                    password: "123456789"
                })
                .then((user) => {
                    expect(user.email).toBe("david@davidbowie.com");
                    expect(user.id).toBe(2);
                    request.get({
                        url: "http://localhost:3000/auth/fake",
                        form: {
                            role: "member",
                            userId: user.id
                        }
                    }, (err, res, body) => {
                        done();
                    });
                    Comment.all()
                    .then((comments) => {
                        const commentCountBeforeDelete = comments.length;
                        expect(commentCountBeforeDelete).toBe(1);
                        request.post(
                            `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                                (err, res, body) => {
                                    Comment.all() 
                                    .then((comments) => {
                                        expect(err).toBeNull();
                                        expect(comments.length).toBe(commentCountBeforeDelete);
                                        done();
                                    })
                                });
                    });
                });
            });
        });

    });
    // END SIGNED-IN (MEMBER) USER CONTEXT


    // ADMIN USER CONTEXT
    describe("admin attempting to perform CRUD actions for Comment", () => {

        // Define a context for admin user.
        beforeEach((done) => {    // before each suite in this context
            request.get({           // mock authentication
                url: "http://localhost:3000/auth/fake",
                form: {
                    role: "admin",     // mock authenticate as member user
                    userId: this.user.id
                }
            },
                (err, res, body) => {
                    
                    done();
                }
            );
        });

        describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {

            it("should delete the comment with the associated ID", (done) => {
                Comment.all()
                .then((comments) => {
                    const commentCountBeforeDelete = comments.length;

                    expect(commentCountBeforeDelete).toBe(1);

                    request.post(
                        `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                        (err, res, body) => {
                            expect(res.statusCode).toBe(302);
                            Comment.all()
                            .then((comments) => {
                                expect(err).toBeNull();
                                expect(comments.length).toBe(commentCountBeforeDelete - 1);
                                
                                done();
                            })
                        });
                });
            });

        });

    });
    // END ADMIN USER CONTEXT

});